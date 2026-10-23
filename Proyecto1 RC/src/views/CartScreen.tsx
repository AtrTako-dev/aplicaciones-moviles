/**
 * Pantalla del carrito de compras (US10).
 *
 * Permite visualizar los productos agregados, modificar cantidades, eliminar
 * artículos y consultar subtotales/total. Toda la lógica de datos y cálculos
 * vive en CartController; esta vista solo presenta y delega acciones.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CartEmptyState from '../components/CartEmptyState';
import CartItemCard from '../components/CartItemCard';
import CartSummary from '../components/CartSummary';
import ErrorMessage from '../components/ErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import PrimaryButton from '../components/PrimaryButton';
import { useCart } from '../navigation/CartContext';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing } from '../utils/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Carrito'>;

// #################### US10: Vista del carrito ####################
export default function CartScreen({ navigation }: Props) {
  const {
    estado,
    carrito,
    errorCarga,
    errorOperacion,
    sincronizando,
    productosPendientes,
    incrementar,
    decrementar,
    eliminarProducto,
    reintentar,
    reintentarSincronizacion,
    limpiarErrorOperacion,
  } = useCart();

  const irAlCatalogo = () => navigation.navigate('Catalogo');

  const ejecutarAccion = (accion: () => Promise<void>) => {
    accion().catch(() => {
      // El controlador conserva el estado local y expone el error en pantalla.
    });
  };

  if (estado === 'cargando' || estado === 'inactivo') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingIndicator message="Cargando tu carrito..." />
      </SafeAreaView>
    );
  }

  if (estado === 'error' && !carrito) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centeredState}>
          <Text style={styles.errorTitle}>No pudimos cargar tu carrito</Text>
          <Text style={styles.message}>
            {errorCarga ?? 'Verifica tu conexión e inténtalo nuevamente.'}
          </Text>
          <PrimaryButton testID="cart-retry-button" title="Reintentar" onPress={reintentar} />
          <PrimaryButton
            testID="cart-back-catalog-button"
            title="Volver al catálogo"
            onPress={irAlCatalogo}
            variant="ghost"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!carrito) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LoadingIndicator message="Cargando tu carrito..." />
      </SafeAreaView>
    );
  }

  const pendiente = (productId: number) => productosPendientes.includes(productId);

  const procederAlPago = () => {
    if (carrito.estaVacio) {
      return;
    }
    Alert.alert(
      'Proceder al pago',
      `Tu pedido por ${carrito.totalFormateado} está listo. El pago se habilitará próximamente.`,
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>STOREFLOW</Text>
        <Text style={styles.title} testID="cart-screen-title">
          Mi carrito
        </Text>
        <Text style={styles.subtitle}>
          {carrito.estaVacio
            ? 'Aún no hay productos en tu carrito.'
            : `${carrito.cantidadTotal} ${
                carrito.cantidadTotal === 1 ? 'unidad' : 'unidades'
              } en ${carrito.items.length} ${
                carrito.items.length === 1 ? 'producto' : 'productos'
              }`}
        </Text>

        {sincronizando ? (
          <View style={styles.syncBanner} testID="cart-sync-banner">
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.syncBannerText}>Sincronizando cambios...</Text>
          </View>
        ) : null}

        {errorCarga && carrito ? <ErrorMessage message={errorCarga} /> : null}
        <ErrorMessage message={errorOperacion} />
        {errorOperacion ? (
          <View style={styles.errorActions}>
            <Pressable
              testID="cart-retry-sync-button"
              accessibilityRole="button"
              accessibilityLabel="Reintentar sincronización"
              onPress={reintentarSincronizacion}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
              <Text style={styles.linkButtonText}>Reintentar sincronización</Text>
            </Pressable>
            <Pressable
              testID="cart-dismiss-error-button"
              accessibilityRole="button"
              accessibilityLabel="Descartar mensaje de error"
              onPress={limpiarErrorOperacion}
              style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}>
              <Text style={styles.linkButtonText}>Descartar</Text>
            </Pressable>
          </View>
        ) : null}

        {carrito.estaVacio ? (
          <CartEmptyState onExplorarCatalogo={irAlCatalogo} />
        ) : (
          <View style={styles.items}>
            {carrito.items.map((item) => (
              <CartItemCard
                key={item.product.id}
                item={item}
                pendiente={pendiente(item.product.id)}
                onIncrementar={() => ejecutarAccion(() => incrementar(item.product.id))}
                onDecrementar={() => ejecutarAccion(() => decrementar(item.product.id))}
                onEliminar={() => ejecutarAccion(() => eliminarProducto(item.product.id))}
              />
            ))}
          </View>
        )}

        <CartSummary
          totalFormateado={carrito.totalFormateado}
          vacio={carrito.estaVacio}
          onProcederAlPago={procederAlPago}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
// #################################### Fin de US10 ####################################

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: Colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  items: {
    gap: Spacing.md,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  syncBannerText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  errorActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  linkButton: {
    paddingVertical: Spacing.xs,
  },
  linkButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});

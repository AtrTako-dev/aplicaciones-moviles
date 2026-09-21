/**
 * Vista del detalle de un producto (US05).
 *
 * Consume /products/{id} mediante el controlador y adapta la interfaz
 * según el rol de la sesión local:
 *  - Cliente / Auditor: solo consulta (sin controles administrativos).
 *  - Administrador: botones Editar y Eliminar funcionales.
 *
 * El rol proviene EXCLUSIVAMENTE de la sesión local (AsyncStorage),
 * nunca de Fake Store API.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSesionLocal } from '../hooks/useSesionLocal';
import { useProductDetailController } from '../controllers/ProductDetailController';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing } from '../utils/theme';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';

type Props = NativeStackScreenProps<AppStackParamList, 'DetalleProducto'>;

export default function ProductDetailScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { isLoading, hasError, product, retry, eliminarProducto } =
    useProductDetailController(productId);
  const { cargando, esAdministrador } = useSesionLocal();

  useRefreshOnFocus(retry);

  const [imagenError, setImagenError] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (hasError) {
      Alert.alert('Producto no disponible', 'No se pudo cargar el producto solicitado.', [
        { text: 'OK', onPress: () => navigation.navigate('Catalogo') },
      ]);
    }
  }, [hasError, navigation]);

  const confirmarEliminar = () => {
    Alert.alert('Eliminar producto', '¿Seguro que deseas eliminar este producto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          setEliminando(true);
          try {
            await eliminarProducto();
            Alert.alert('Producto eliminado', 'El producto se eliminó correctamente.', [
              { text: 'OK', onPress: () => navigation.navigate('Catalogo') },
            ]);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el producto. Inténtalo nuevamente.');
          } finally {
            setEliminando(false);
          }
        },
      },
    ]);
  };

  const openEditor = () => {
    navigation.navigate('EditarProducto', { productId });
  };

  if (cargando || isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.message}>Cargando producto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasError && !product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centeredState}>
          <Text style={styles.errorTitle}>Producto no disponible</Text>
          <Text style={styles.message}>No se pudo obtener la información del producto.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centeredState}>
          <Text style={styles.errorTitle}>Producto no disponible</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {imagenError ? (
            <View style={styles.imageFallback}>
              <Text style={styles.fallbackText}>Imagen no disponible</Text>
            </View>
          ) : (
            <Image
              source={{ uri: product.image }}
              style={styles.image}
              resizeMode="contain"
              onError={() => setImagenError(true)}
            />
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.category}>{product.category}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{product.formattedPrice}</Text>
          <Text style={styles.rating} testID="detail-rating">
            Calificación: {product.rating.rate} ({product.rating.count} reseñas)
          </Text>
          <Text style={styles.label}>Descripción</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {esAdministrador ? (
          <View style={styles.adminActions}>
            <Pressable
              testID="detail-edit-button"
              accessibilityRole="button"
              accessibilityLabel="Editar"
              disabled={eliminando}
              onPress={openEditor}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
                eliminando && styles.buttonDisabled,
              ]}>
              <Text style={styles.primaryButtonText}>Editar</Text>
            </Pressable>
            <Pressable
              testID="detail-delete-button"
              accessibilityRole="button"
              accessibilityLabel="Eliminar"
              disabled={eliminando}
              onPress={confirmarEliminar}
              style={({ pressed }) => [
                styles.dangerButton,
                pressed && styles.buttonPressed,
                eliminando && styles.buttonDisabled,
              ]}>
              <Text style={styles.dangerButtonText}>Eliminar</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  message: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: Colors.card,
    borderRadius: Spacing.md,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  fallbackText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  info: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 28,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  description: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 22,
  },
  adminActions: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  dangerButton: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
});

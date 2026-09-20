/**
 * Vista del catálogo general de productos (US03).
 *
 * Maneja tres estados explícitos:
 *  - LOADING: indicador de carga centrado.
 *  - SUCCESS: catálogo renderizado con FlatList.
 *  - ERROR:   mensaje amigable y botón "Reintentar".
 */

import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ProductCard from '../components/ProductCard';
import { useProductController } from '../controllers/ProductController';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing } from '../utils/theme';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';

export default function ProductCatalogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { isLoading, hasError, products, retry } = useProductController();

  useRefreshOnFocus(retry);

  const openDetail = (productId: number) => {
    navigation.navigate('DetalleProducto', { productId });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (hasError) {
    return <ErrorState onRetry={retry} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProductCard product={item} onPress={() => openDetail(item.id)} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Catálogo de productos</Text>
            <Text style={styles.subtitle}>{products.length} productos disponibles</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function LoadingState() {
  return (
    <View style={styles.centeredState}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.message}>Cargando productos...</Text>
    </View>
  );
}

interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <View style={styles.centeredState}>
      <Text style={styles.errorTitle}>No pudimos cargar el catálogo.</Text>
      <Text style={styles.message}>Verifica tu conexión e inténtalo nuevamente.</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Reintentar"
        style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  row: {
    gap: Spacing.md,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  message: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  retryButtonPressed: {
    opacity: 0.7,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
/**
 * Vista del catálogo general de productos (US03).
 *
 * Maneja tres estados explícitos:
 *  - LOADING: indicador de carga centrado.
 *  - SUCCESS: catálogo renderizado con FlatList.
 *  - ERROR:   mensaje amigable y botón "Reintentar".
 */

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import ProductCard from '../components/ProductCard';
import { useProductController } from '../controllers/ProductController';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { Colors, Spacing } from '../utils/theme';

export default function ProductCatalogScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {
    isLoading,
    hasError,
    products,
    retry,
    categories,
    categoriesLoading,
    categoriesError,
    selectedCategory,
    selectCategory,
  } = useProductController();

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
        removeClippedSubviews={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={16}
        windowSize={15}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.eyebrow}>STOREFLOW</Text>
            <Text style={styles.title}>Explora productos</Text>
            <Text style={styles.subtitle}>
              {selectedCategory ? `Categoría: ${selectedCategory}` : 'Todos los productos'}
            </Text>
            <Text style={styles.filterLabel}>Filtrar por categoría</Text>
            {categoriesLoading ? (
              <ActivityIndicator color={Colors.primary} style={styles.categoriesLoading} />
            ) : categoriesError ? (
              <Text style={styles.categoriesError}>No se pudieron cargar las categorías.</Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chips}>
                <CategoryChip
                  label="Ver todos"
                  selected={selectedCategory === null}
                  onPress={() => selectCategory(null)}
                />
                {categories.map((category) => (
                  <CategoryChip
                    key={category}
                    label={category}
                    selected={selectedCategory === category}
                    onPress={() => selectCategory(category)}
                  />
                ))}
              </ScrollView>
            )}
            <Text style={styles.count}>{products.length} productos disponibles</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function CategoryChip({ label, selected, onPress }: CategoryChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Filtrar por ${label}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.chipPressed,
      ]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
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
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: Colors.primary,
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
  filterLabel: {
    marginTop: Spacing.sm,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  chips: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
    borderRadius: 999,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipPressed: {
    opacity: 0.8,
  },
  chipText: {
    color: Colors.text,
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  chipTextSelected: {
    color: Colors.white,
  },
  categoriesLoading: {
    alignSelf: 'flex-start',
    marginVertical: Spacing.sm,
  },
  categoriesError: {
    color: Colors.error,
    fontSize: 13,
  },
  count: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
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

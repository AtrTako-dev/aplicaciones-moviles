import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorMessage from '../components/ErrorMessage';
import LoadingIndicator from '../components/LoadingIndicator';
import PrimaryButton from '../components/PrimaryButton';
import { catalogController } from '../config/AppContainer';
import { Producto } from '../model/Producto';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { ErrorAmigable } from '../services/ErrorAmigable';
import { Colors, Spacing } from '../utils/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Catalog'>;

const MENSAJE_ERROR_PRODUCTOS =
  'No fue posible cargar los productos. Verifica tu conexión.';

function mensajeError(error: unknown, fallback: string): string {
  return error instanceof ErrorAmigable ? error.message : fallback;
}

function formatearPrecio(precio: number): string {
  return `$${precio.toFixed(2)}`;
}

export default function CatalogScreen({ navigation }: Props) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState(false);

  const montadoRef = useRef(true);
  const peticionRef = useRef(0);

  const cargarProductos = useCallback(async (categoria: string | null) => {
    const idPeticion = peticionRef.current + 1;
    peticionRef.current = idPeticion;

    try {
      const datos = await catalogController.obtenerProductos(categoria);
      if (montadoRef.current && peticionRef.current === idPeticion) {
        setProductos(datos);
      }
    } catch (errorCapturado) {
      if (montadoRef.current && peticionRef.current === idPeticion) {
        setError(mensajeError(errorCapturado, MENSAJE_ERROR_PRODUCTOS));
      }
    } finally {
      if (montadoRef.current && peticionRef.current === idPeticion) {
        setLoading(false);
      }
    }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const datos = await catalogController.obtenerCategorias();
      if (montadoRef.current) {
        setCategorias([...new Set(datos)]);
      }
    } catch {
      if (montadoRef.current) {
        setErrorCategorias(true);
      }
    } finally {
      if (montadoRef.current) {
        setCargandoCategorias(false);
      }
    }
  }, []);

  useEffect(() => {
    montadoRef.current = true;
    Promise.resolve().then(() => {
      void cargarCategorias();
      void cargarProductos(null);
    });
    return () => {
      montadoRef.current = false;
      peticionRef.current += 1;
    };
  }, [cargarCategorias, cargarProductos]);

  const seleccionarCategoria = (categoria: string | null) => {
    setCategoriaSeleccionada(categoria);
    setError(null);
    setLoading(true);
    setProductos([]);
    void cargarProductos(categoria);
  };

  const filtrarPorCategoria = (categoria: string) => {
    if (categoria === categoriaSeleccionada) {
      return;
    }
    seleccionarCategoria(categoria);
  };

  const verTodos = () => {
    seleccionarCategoria(null);
  };

  const abrirDetalle = (producto: Producto) => {
    navigation.navigate('ProductDetail', { producto });
  };

  const header = (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Catálogo</Text>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
      </View>
      <Text style={styles.sectionLabel}>Filtrar por categoría</Text>

      {cargandoCategorias ? (
        <ActivityIndicator
          size="small"
          color={Colors.primary}
          style={styles.categoriasLoading}
        />
      ) : errorCategorias ? (
        <Text style={styles.categoriasError}>
          No se pudieron cargar las categorías. Puedes ver todos los productos.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          <CategoriaChip
            label="Ver todos"
            selected={categoriaSeleccionada === null}
            onPress={verTodos}
          />
          {categorias.map((categoria) => (
            <CategoriaChip
              key={categoria}
              label={categoria}
              selected={categoriaSeleccionada === categoria}
              onPress={() => filtrarPorCategoria(categoria)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderProducto = ({ item }: { item: Producto }) => (
    <Pressable
      style={({ pressed }) => [styles.card, pressed ? styles.cardPressed : null]}
      onPress={() => abrirDetalle(item)}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${item.title}`}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="contain" />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <Text style={styles.cardPrice}>{formatearPrecio(item.price)}</Text>
        <Text style={styles.cardLink}>Ver detalle</Text>
      </View>
    </Pressable>
  );

  const listEmpty = loading ? (
    <LoadingIndicator message="Cargando productos..." />
  ) : error ? (
    <View style={styles.emptyContainer}>
      <ErrorMessage message={error} />
      <PrimaryButton
        testID="catalog-retry"
        title="Reintentar"
        variant="secondary"
        onPress={() => cargarProductos(categoriaSeleccionada)}
      />
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No hay productos para mostrar.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        testID="catalog-list"
        data={loading ? [] : productos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProducto}
        ListHeaderComponent={header}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

interface CategoriaChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function CategoriaChip({ label, selected, onPress }: CategoriaChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipSelected : null]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
  },
  backLink: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  categoriasLoading: {
    alignSelf: 'flex-start',
    marginVertical: Spacing.sm,
  },
  categoriasError: {
    fontSize: 13,
    color: Colors.error,
    marginVertical: Spacing.sm,
  },
  chipsContainer: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
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
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.white,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardImage: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  cardBody: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  cardCategory: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textTransform: 'capitalize',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  cardLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
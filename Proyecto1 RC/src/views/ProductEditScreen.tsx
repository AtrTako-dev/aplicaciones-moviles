/**
 * Pantalla de edición de producto (US05, rol Administrador).
 *
 * Carga la información actual del producto, permite modificarla,
 * valida los campos y envía la petición PUT /products/{id}.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ErrorMessage from '../components/ErrorMessage';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import { useProductDetailController } from '../controllers/ProductDetailController';
import type { AppStackParamList } from '../navigation/AppNavigator';
import type { Product } from '../model/Product';
import { ProductServiceError } from '../services/ProductDetailService';
import { Colors, Spacing } from '../utils/theme';
import { validateProductForm } from '../utils/validators';

type Props = NativeStackScreenProps<AppStackParamList, 'EditarProducto'>;

export default function ProductEditScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const {
    status,
    product,
    guardarProducto,
  } = useProductDetailController(productId);

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.message}>Cargando producto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (status === 'error' || !product) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centeredState}>
          <Text style={styles.errorTitle}>Producto no disponible</Text>
          <PrimaryButton
            title="Volver al catálogo"
            onPress={() => navigation.navigate('Catalogo')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ProductEditForm
      product={product}
      onSave={guardarProducto}
      onBack={() => navigation.goBack()}
      onGoCatalog={() => navigation.navigate('Catalogo')}
    />
  );
}

interface ProductEditFormProps {
  product: Product;
  onSave: (data: {
    title: string;
    price: number;
    description: string;
    category: string;
  }) => Promise<Product | null>;
  onBack: () => void;
  onGoCatalog: () => void;
}

function ProductEditForm({ product, onSave, onBack, onGoCatalog }: ProductEditFormProps) {
  const [title, setTitle] = useState(product.title);
  const [price, setPrice] = useState(product.price.toFixed(2));
  const [description, setDescription] = useState(product.description);
  const [category, setCategory] = useState(product.category);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const handleSave = async () => {
    setFormError(null);
    const errors = validateProductForm({ title, price, description, category });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        price: Number(price),
        description: description.trim(),
        category: category.trim(),
      });
      Alert.alert('Producto actualizado', 'Los cambios se guardaron correctamente.', [
        { text: 'OK', onPress: onBack },
      ]);
    } catch (error) {
      setFormError(
        error instanceof ProductServiceError
          ? error.message
          : 'No se pudo guardar el producto. Inténtalo nuevamente.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Editar producto</Text>

          <InputField
            testID="edit-title"
            label="Título"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              clearFieldError('title');
            }}
            placeholder="Nombre del producto"
            autoCapitalize="sentences"
            error={fieldErrors.title || null}
          />

          <InputField
            testID="edit-price"
            label="Precio"
            value={price}
            onChangeText={(text) => {
              setPrice(text);
              clearFieldError('price');
            }}
            placeholder="0.00"
            keyboardType="decimal-pad"
            error={fieldErrors.price || null}
          />

          <InputField
            testID="edit-category"
            label="Categoría"
            value={category}
            onChangeText={(text) => {
              setCategory(text);
              clearFieldError('category');
            }}
            placeholder="Categoría del producto"
            autoCapitalize="sentences"
            error={fieldErrors.category || null}
          />

          <InputField
            testID="edit-description"
            label="Descripción"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              clearFieldError('description');
            }}
            placeholder="Descripción del producto"
            autoCapitalize="sentences"
            error={fieldErrors.description || null}
          />

          <ErrorMessage message={formError} />

          <PrimaryButton
            testID="edit-save"
            title="Guardar cambios"
            onPress={handleSave}
            loading={saving}
          />

          <PrimaryButton
            testID="edit-cancel"
            title="Cancelar"
            variant="ghost"
            onPress={onGoCatalog}
            disabled={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing.lg,
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
});

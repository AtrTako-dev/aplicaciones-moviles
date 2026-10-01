/**
 * Pantalla de creación de producto (US06, rol Administrador).
 *
 * El formulario valida localmente todos los campos (título, precio,
 * descripción, URL de imagen y categoría) antes de enviar POST /products.
 * En éxito muestra una alerta con el nuevo ID generado y limpia el formulario.
 *
 * El rol proviene EXCLUSIVAMENTE de la sesión local (AsyncStorage): si un
 * usuario Cliente o Auditor intenta acceder por enlace profundo o alteración
 * de estado, se le redirige inmediatamente al catálogo principal.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
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
import { useSesionLocal } from '../hooks/useSesionLocal';
import type { AppStackParamList } from '../navigation/AppNavigator';
import { createProduct, ProductServiceError } from '../services/ProductDetailService';
import { Colors, Spacing } from '../utils/theme';
import { validateProductCreateForm } from '../utils/validators';

type Props = NativeStackScreenProps<AppStackParamList, 'CrearProducto'>;

export default function ProductCreateScreen({ navigation }: Props) {
  const { cargando, esAdministrador, role } = useSesionLocal();

  useEffect(() => {
    if (!cargando && !esAdministrador) {
      navigation.replace('Catalogo');
    }
  }, [cargando, esAdministrador, navigation]);

  if (cargando) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.message}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!esAdministrador) {
    return null;
  }

  return <ProductCreateForm role={role ?? ''} onGoCatalog={() => navigation.replace('Catalogo')} />;
}

interface ProductCreateFormProps {
  role: string;
  onGoCatalog: () => void;
}

function ProductCreateForm({ role, onGoCatalog }: ProductCreateFormProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
  };

  const cleanForm = () => {
    setTitle('');
    setPrice('');
    setCategory('');
    setImageUrl('');
    setDescription('');
    setFieldErrors({});
  };

  const handleSave = async () => {
    setFormError(null);
    const errors = validateProductCreateForm({ title, price, description, image: imageUrl, category });
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setSaving(true);
    try {
      const creado = await createProduct(
        {
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
          image: imageUrl.trim(),
          category: category.trim(),
        },
        role,
      );
      Alert.alert(
        'Producto creado',
        `El producto se registró correctamente con el ID ${creado.id}.`,
        [{ text: 'OK', onPress: cleanForm }],
      );
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
          <Text style={styles.title}>Nuevo producto</Text>
          <Text style={styles.subtitle}>
            Completa los campos para registrar un artículo en el inventario.
          </Text>

          <InputField
            testID="create-title"
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
            testID="create-price"
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
            testID="create-category"
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
            testID="create-image"
            label="URL de imagen"
            value={imageUrl}
            onChangeText={(text) => {
              setImageUrl(text);
              clearFieldError('image');
            }}
            placeholder="https://ejemplo.com/imagen.jpg"
            autoCapitalize="none"
            error={fieldErrors.image || null}
          />

          <InputField
            testID="create-description"
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

          <PrimaryButton testID="create-save" title="Guardar producto" onPress={handleSave} loading={saving} />

          <PrimaryButton
            testID="create-cancel"
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
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: Spacing.lg,
  },
});
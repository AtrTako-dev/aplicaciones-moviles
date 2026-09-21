/**
 * Componente reutilizable que representa una tarjeta de producto dentro
 * del catálogo. Muestra imagen, título y precio.
 */

import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '../utils/theme';
import { Product } from '../model/Product';

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalle de ${product.title}`}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.imageContainer}>
        {imageFailed ? (
          <View style={styles.imageFallback}>
            <Text style={styles.fallbackText}>Imagen no disponible</Text>
          </View>
        ) : (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.category} numberOfLines={1}>
          {product.category}
        </Text>
        <Text style={styles.price}>{product.formattedPrice}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Spacing.md,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.85,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  image: {
    flex: 1,
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  fallbackText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  info: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    minHeight: 40,
  },
  category: {
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: Spacing.xs,
  },
});
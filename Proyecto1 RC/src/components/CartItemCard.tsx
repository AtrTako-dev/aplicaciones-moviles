/**
 * Fila reutilizable de un artículo del carrito (US10).
 *
 * Presenta imagen, nombre, precio unitario, cantidad, subtotal y las acciones
 * de incrementar, decrementar y eliminar. Los controles se deshabilitan solo
 * para el producto cuya petición está en curso, sin bloquear los demás.
 */

import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { ItemCarrito } from '../model/Carrito';
import { Colors, Spacing } from '../utils/theme';

interface CartItemCardProps {
  item: ItemCarrito;
  pendiente?: boolean;
  onIncrementar: () => void;
  onDecrementar: () => void;
  onEliminar: () => void;
}

// #################### US10: Tarjeta de artículo del carrito ####################
export default function CartItemCard({
  item,
  pendiente = false,
  onIncrementar,
  onDecrementar,
  onEliminar,
}: CartItemCardProps) {
  const [imagenFallida, setImagenFallida] = useState(false);
  const productId = item.product.id;

  return (
    <View style={styles.card} testID={`cart-item-${productId}`}>
      <View style={styles.imageContainer}>
        {imagenFallida ? (
          <View style={styles.imageFallback}>
            <Text style={styles.fallbackText}>Imagen no disponible</Text>
          </View>
        ) : (
          <Image
            testID={`cart-item-image-${productId}`}
            source={{ uri: item.product.image }}
            style={styles.image}
            resizeMode="contain"
            onError={() => setImagenFallida(true)}
          />
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2} testID={`cart-item-title-${productId}`}>
          {item.product.title}
        </Text>
        <Text style={styles.unitPrice} testID={`cart-item-unit-price-${productId}`}>
          {item.precioUnitarioFormateado} c/u
        </Text>

        <View style={styles.actionsRow}>
          <View style={styles.quantityControls}>
            <Pressable
              testID={`cart-decrement-${productId}`}
              accessibilityRole="button"
              accessibilityLabel={`Disminuir cantidad de ${item.product.title}`}
              accessibilityState={{ disabled: pendiente }}
              disabled={pendiente}
              onPress={onDecrementar}
              style={({ pressed }) => [
                styles.quantityButton,
                pressed && !pendiente ? styles.pressed : null,
                pendiente ? styles.disabled : null,
              ]}>
              <Text style={styles.quantityButtonText}>−</Text>
            </Pressable>

            <Text
              style={styles.quantity}
              testID={`cart-item-quantity-${productId}`}
              accessibilityLabel={`Cantidad: ${item.cantidad}`}>
              {item.cantidad}
            </Text>

            <Pressable
              testID={`cart-increment-${productId}`}
              accessibilityRole="button"
              accessibilityLabel={`Aumentar cantidad de ${item.product.title}`}
              accessibilityState={{ disabled: pendiente }}
              disabled={pendiente}
              onPress={onIncrementar}
              style={({ pressed }) => [
                styles.quantityButton,
                pressed && !pendiente ? styles.pressed : null,
                pendiente ? styles.disabled : null,
              ]}>
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>

          <Pressable
            testID={`cart-delete-${productId}`}
            accessibilityRole="button"
            accessibilityLabel={`Eliminar ${item.product.title} del carrito`}
            accessibilityState={{ disabled: pendiente }}
            disabled={pendiente}
            onPress={onEliminar}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && !pendiente ? styles.pressed : null,
              pendiente ? styles.disabled : null,
            ]}>
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </Pressable>
        </View>

        <View style={styles.subtotalRow}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalValue} testID={`cart-item-subtotal-${productId}`}>
            {item.subtotalFormateado}
          </Text>
        </View>

        {pendiente ? (
          <View style={styles.syncRow} testID={`cart-item-syncing-${productId}`}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.syncText}>Actualizando...</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
// #################################### Fin de US10 ####################################

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Spacing.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    width: 88,
    height: 88,
    borderRadius: Spacing.sm,
    backgroundColor: Colors.background,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xs,
  },
  fallbackText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  info: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  unitPrice: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  quantityButton: {
    minWidth: 34,
    minHeight: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  quantity: {
    minWidth: 34,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  deleteButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  subtotalLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  syncText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  pressed: {
    opacity: 0.75,
  },
  disabled: {
    opacity: 0.45,
  },
});

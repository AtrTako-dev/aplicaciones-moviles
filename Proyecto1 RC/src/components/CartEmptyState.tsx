/**
 * Estado vacío del carrito (US10).
 *
 * Muestra el mensaje exacto solicitado y una acción para volver al catálogo.
 */

import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from './PrimaryButton';
import { Colors, Spacing } from '../utils/theme';

interface CartEmptyStateProps {
  onExplorarCatalogo: () => void;
}

// #################### US10: Carrito vacío ####################
export default function CartEmptyState({ onExplorarCatalogo }: CartEmptyStateProps) {
  return (
    <View style={styles.container} testID="cart-empty-state">
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>🛒</Text>
      </View>
      <Text style={styles.message} testID="cart-empty-message">
        Tu carrito está vacío, explora el catálogo
      </Text>
      <PrimaryButton
        testID="cart-explore-button"
        title="Explorar catálogo"
        onPress={onExplorarCatalogo}
        variant="secondary"
      />
    </View>
  );
}
// #################################### Fin de US10 ####################################

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    fontSize: 36,
  },
  message: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
});

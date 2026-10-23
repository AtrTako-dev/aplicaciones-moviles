/**
 * Resumen monetario del carrito y acción de pago (US10).
 *
 * El total siempre proviene del modelo local; el botón de pago se desactiva
 * cuando no existen artículos.
 */

import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from './PrimaryButton';
import { Colors, Spacing } from '../utils/theme';

interface CartSummaryProps {
  totalFormateado: string;
  vacio: boolean;
  onProcederAlPago: () => void;
}

// #################### US10: Total y botón de pago ####################
export default function CartSummary({
  totalFormateado,
  vacio,
  onProcederAlPago,
}: CartSummaryProps) {
  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue} testID="cart-total">
          {totalFormateado}
        </Text>
      </View>

      {vacio ? (
        <Text style={styles.hint}>Agrega productos para poder proceder al pago.</Text>
      ) : null}

      <PrimaryButton
        testID="cart-checkout-button"
        title="Proceder al pago"
        onPress={onProcederAlPago}
        disabled={vacio}
      />
    </View>
  );
}
// #################################### Fin de US10 ####################################

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: Spacing.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.primary,
  },
  hint: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});

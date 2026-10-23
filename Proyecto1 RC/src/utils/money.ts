/**
 * Utilidades monetarias (US10).
 *
 * Los importes se manejan internamente en centavos enteros para evitar los
 * errores de precisión de los números decimales de JavaScript.
 */

// #################### US10: Conversión y formato de importes ####################
export function aCentavos(precio: number): number {
  if (!Number.isFinite(precio) || precio <= 0) {
    return 0;
  }
  return Math.round((precio + Number.EPSILON) * 100);
}

export function formatearMoneda(centavos: number): string {
  const valorSeguro = Number.isFinite(centavos) ? Math.max(0, Math.round(centavos)) : 0;
  return `$${(valorSeguro / 100).toFixed(2)}`;
}
// #################################### Fin de US10 ####################################

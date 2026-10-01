/**
 * Mensaje flotante de éxito (Toast/Snackbar) — US08.
 *
 * En Android usa el Toast nativo; en el resto de plataformas recurre a un
 * Alert con el mismo propósito de confirmación no intrusiva.
 */

import { Alert, Platform, ToastAndroid } from 'react-native';

export function mostrarMensajeFlotante(mensaje: string, alCerrar?: () => void): void {
  if (Platform.OS === 'android') {
    ToastAndroid.show(mensaje, ToastAndroid.SHORT);
    alCerrar?.();
    return;
  }
  Alert.alert('Listo', mensaje, [{ text: 'OK', onPress: alCerrar }]);
}
/**
 * Hook que ejecuta un callback cuando la pantalla vuelve a estar enfocada
 * (por ejemplo, al regresar tras editar o eliminar un producto), omitiendo
 * el primer foco porque la carga inicial ya ocurrió en el montaje.
 */

import { useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function useRefreshOnFocus(callback: () => void) {
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      callback();
    }, [callback]),
  );
}
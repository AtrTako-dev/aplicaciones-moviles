import * as SecureStore from 'expo-secure-store';
import { Sesion } from '../model/Sesion';
import { ErrorAmigable } from './ErrorAmigable';

const CLAVE_SESION = 'voz_urbana_sesion';
const CLAVE_CARRITO = 'voz_urbana_carrito';

export class StorageService {
  async guardarSesion(sesion: Sesion): Promise<void> {
    try {
      await SecureStore.setItemAsync(CLAVE_SESION, sesion.aJson());
    } catch {
      throw new ErrorAmigable('No se pudo guardar la sesión. Inténtalo nuevamente.');
    }
  }

  async recuperarSesion(): Promise<Sesion | null> {
    try {
      const valor = await SecureStore.getItemAsync(CLAVE_SESION);
      if (!valor) {
        return null;
      }
      return Sesion.desdeJson(valor);
    } catch {
      return null;
    }
  }

  async eliminarSesion(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CLAVE_SESION);
    } catch {
      throw new ErrorAmigable('No se pudo eliminar la sesión del dispositivo. Inténtalo nuevamente.');
    }
  }

  async limpiarCarrito(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CLAVE_CARRITO);
    } catch {
      throw new ErrorAmigable('No se pudo eliminar el carrito del dispositivo. Inténtalo nuevamente.');
    }
  }
}

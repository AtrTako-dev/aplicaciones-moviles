/**
 * Persistencia local del carrito (US10).
 *
 * El estado local del dispositivo es la fuente inmediata de verdad. Se guarda
 * una instantánea por usuario para conservar las cantidades, eliminaciones y
 * totales aunque la pantalla se vuelva a montar.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Carrito } from '../model/Carrito';

export interface CartStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const CART_KEY_PREFIX = '@storeflow/carrito';

// #################### US10: Persistencia del carrito local ####################
export class CartStorageService {
  constructor(private readonly storage: CartStorage = AsyncStorage) {}

  async guardar(userId: number, carrito: Carrito): Promise<void> {
    await this.storage.setItem(this.clave(userId), JSON.stringify(carrito.aJson()));
  }

  async recuperar(userId: number): Promise<Carrito | null> {
    try {
      const raw = await this.storage.getItem(this.clave(userId));
      if (!raw) {
        return null;
      }
      const carrito = Carrito.desdeJson(JSON.parse(raw) as unknown);
      return carrito.userId === userId ? carrito : null;
    } catch {
      return null;
    }
  }

  async eliminar(userId: number): Promise<void> {
    await this.storage.removeItem(this.clave(userId));
  }

  private clave(userId: number): string {
    return `${CART_KEY_PREFIX}/${userId}`;
  }
}

export const cartStorageService = new CartStorageService();
// #################################### Fin de US10 ####################################

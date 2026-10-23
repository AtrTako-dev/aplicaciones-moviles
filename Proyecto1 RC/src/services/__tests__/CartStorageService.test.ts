import { describe, expect, it } from '@jest/globals';

import { Carrito, ItemCarrito } from '../../model/Carrito';
import { Product } from '../../model/Product';
import { CartStorageService, CartStorage } from '../CartStorageService';

function producto(id: number, price: number): Product {
  return Product.fromJson({
    id,
    title: `Producto ${id}`,
    price,
    description: `Descripción ${id}`,
    category: 'test',
    image: `https://fake.img/${id}.png`,
    rating: { rate: 4.5, count: 10 },
  });
}

class MemoryStorage implements CartStorage {
  valores = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.valores.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.valores.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.valores.delete(key);
  }
}

describe('CartStorageService - persistencia local (US10)', () => {
  it('guarda y recupera el carrito del usuario con sus cantidades', async () => {
    const storage = new MemoryStorage();
    const service = new CartStorageService(storage);
    const carrito = new Carrito(6, 4, [
      new ItemCarrito(producto(10, 100), 2),
      new ItemCarrito(producto(12, 49.99), 3),
    ]);

    await service.guardar(4, carrito);
    const recuperado = await service.recuperar(4);

    expect(recuperado?.id).toBe(6);
    expect(recuperado?.totalFormateado).toBe('$349.97');
    expect(recuperado?.cantidadDe(10)).toBe(2);
  });

  it('no devuelve el carrito de otro usuario', async () => {
    const storage = new MemoryStorage();
    const service = new CartStorageService(storage);
    await service.guardar(4, Carrito.vacio(6, 4));

    await expect(service.recuperar(5)).resolves.toBeNull();
  });

  it('elimina el carrito guardado del usuario', async () => {
    const storage = new MemoryStorage();
    const service = new CartStorageService(storage);
    await service.guardar(4, Carrito.vacio(6, 4));

    await service.eliminar(4);

    await expect(service.recuperar(4)).resolves.toBeNull();
  });

  it('devuelve null si la instantánea está corrupta', async () => {
    const storage = new MemoryStorage();
    const service = new CartStorageService(storage);
    await storage.setItem('@storeflow/carrito/4', '{corrupto');

    await expect(service.recuperar(4)).resolves.toBeNull();
  });
});

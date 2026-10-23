/**
 * Adaptador entre el carrito y el catálogo de productos existente (US10).
 *
 * Reutiliza ProductDetailService para presentar nombre, imagen, precio y
 * categoría reales de cada producto referenciado por el carrito.
 */

import { Product } from '../model/Product';
import { getProductById, getProducts } from './ProductDetailService';

export interface CartProductProvider {
  obtenerProductos(): Promise<Product[]>;
  obtenerProducto(id: number): Promise<Product>;
}

// #################### US10: Datos de catálogo para el carrito ####################
export class FakeStoreCartProductService implements CartProductProvider {
  async obtenerProductos(): Promise<Product[]> {
    return getProducts();
  }

  async obtenerProducto(id: number): Promise<Product> {
    return getProductById(id);
  }
}
// #################################### Fin de US10 ####################################

/**
 * Servicio encargado de la comunicación con la Fake Store API.
 */

import { Product } from '../model/Product';

export const FAKE_STORE_PRODUCTS_URL = 'https://fakestoreapi.com/products';

export class ProductServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

/**
 * Realiza la petición GET a /products y devuelve la lista de productos.
 * Lanza ProductServiceError si la petición o el procesamiento fallan.
 */
export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  let response: Response;
  try {
    response = await fetch(FAKE_STORE_PRODUCTS_URL, { signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new ProductServiceError('No se pudo conectar con el servidor.');
  }

  if (!response.ok) {
    throw new ProductServiceError(`El servidor respondió con el estado HTTP ${response.status}.`);
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ProductServiceError('La respuesta del servidor no es válida.');
  }

  if (!Array.isArray(json)) {
    throw new ProductServiceError('La respuesta no contiene la lista de productos.');
  }

  try {
    return json.map((item) => Product.fromJson(item));
  } catch {
    throw new ProductServiceError('Los datos recibidos no se pudieron interpretar.');
  }
}
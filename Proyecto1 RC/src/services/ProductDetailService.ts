/**
 * Servicio encargado de la comunicación con la Fake Store API.
 */

import { Product } from '../model/Product';

export const FAKE_STORE_PRODUCTS_URL = 'https://fakestoreapi.com/products';

export async function getProductCategories(signal?: AbortSignal): Promise<string[]> {
  let response: Response;
  try {
    response = await fetch(`${FAKE_STORE_PRODUCTS_URL}/categories`, { signal });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ProductServiceError('No se pudieron cargar las categorías.');
  }

  if (!response.ok) {
    throw new ProductServiceError(`El servidor respondió con el estado HTTP ${response.status}.`);
  }

  const json: unknown = await response.json();
  if (!Array.isArray(json) || json.some((category) => typeof category !== 'string')) {
    throw new ProductServiceError('Las categorías recibidas no son válidas.');
  }
  return json;
}

export class ProductServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

export interface ProductUpdateData {
  title: string;
  price: number;
  description: string;
  category: string;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Realiza la petición GET a /products y devuelve la lista de productos.
 * Lanza ProductServiceError si la petición o el procesamiento fallan.
 */
export async function getProducts(signal?: AbortSignal): Promise<Product[]> {
  let response: Response;
  try {
    response = await fetch(FAKE_STORE_PRODUCTS_URL, { signal });
  } catch (error) {
    if (isAbortError(error)) {
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

/** Alias compatible: la versión original del catálogo usa fetchProducts. */
export async function fetchProducts(signal?: AbortSignal): Promise<Product[]> {
  return getProducts(signal);
}

export async function getProductsByCategory(
  category: string,
  signal?: AbortSignal,
): Promise<Product[]> {
  if (!category.trim()) return getProducts(signal);

  let response: Response;
  try {
    response = await fetch(
      `${FAKE_STORE_PRODUCTS_URL}/category/${encodeURIComponent(category)}`,
      { signal },
    );
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw new ProductServiceError('No se pudo cargar la categoría seleccionada.');
  }

  if (!response.ok) {
    throw new ProductServiceError(`El servidor respondió con el estado HTTP ${response.status}.`);
  }

  const json: unknown = await response.json();
  if (!Array.isArray(json)) {
    throw new ProductServiceError('La respuesta no contiene la lista de productos.');
  }
  try {
    return json.map((item) => Product.fromJson(item));
  } catch {
    throw new ProductServiceError('Los datos recibidos no se pudieron interpretar.');
  }
}

function isValidPositiveId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

/**
 * Obtiene un único producto desde /products/{id}.
 * Lanza ProductServiceError ante un id inválido, HTTP != 2xx o una
 * respuesta que no pueda interpretarse como producto.
 */
export async function getProductById(id: number, signal?: AbortSignal): Promise<Product> {
  if (!isValidPositiveId(id)) {
    throw new ProductServiceError('ID de producto inválido.');
  }

  let response: Response;
  try {
    response = await fetch(`${FAKE_STORE_PRODUCTS_URL}/${id}`, { signal });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ProductServiceError('No se pudo conectar con el servidor.');
  }

  if (response.status === 404) {
    throw new ProductServiceError('El producto no existe.');
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

  try {
    return Product.fromJson(json);
  } catch {
    throw new ProductServiceError('Los datos recibidos no se pudieron interpretar.');
  }
}

/**
 * Actualiza un producto vía PUT /products/{id}.
 * Fake Store API responde con el producto resultante; se intenta interpretar
 * y se devuelve, o null si la respuesta no tiene el formato esperado.
 */
export async function updateProduct(
  id: number,
  data: ProductUpdateData,
  signal?: AbortSignal,
): Promise<Product | null> {
  if (!isValidPositiveId(id)) {
    throw new ProductServiceError('ID de producto inválido.');
  }

  let response: Response;
  try {
    response = await fetch(`${FAKE_STORE_PRODUCTS_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
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

  try {
    return Product.fromJson(json);
  } catch {
    return null;
  }
}

/**
 * Elimina un producto vía DELETE /products/{id}.
 */
export async function deleteProduct(id: number, signal?: AbortSignal): Promise<void> {
  if (!isValidPositiveId(id)) {
    throw new ProductServiceError('ID de producto inválido.');
  }

  let response: Response;
  try {
    response = await fetch(`${FAKE_STORE_PRODUCTS_URL}/${id}`, {
      method: 'DELETE',
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    throw new ProductServiceError('No se pudo conectar con el servidor.');
  }

  if (!response.ok) {
    throw new ProductServiceError(`El servidor respondió con el estado HTTP ${response.status}.`);
  }
}

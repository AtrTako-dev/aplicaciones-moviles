/**
 * Servicio encargado de la comunicación con la Fake Store API.
 */

import { Product, ProductEdicion } from '../model/Product';

export const FAKE_STORE_PRODUCTS_URL = 'https://fakestoreapi.com/products';

/** Rol permitido para editar productos (US07). */
export const ROL_ADMINISTRADOR = 'Administrador';

/**
 * Caché local de ediciones (US07).
 * Fake Store API solo simula la actualización y no persiste los cambios;
 * esta caché conserva el producto editado dentro de la sesión de la app
 * para que el catálogo y el detalle reflejen la edición.
 */
const edicionesLocales = new Map<number, ProductEdicion>();

function aplicarEdicionLocal(product: Product): Product {
  const edicion = edicionesLocales.get(product.id);
  return edicion ? product.conEdiciones(edicion) : product;
}

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

export type ProductUpdateData = ProductEdicion;

export interface ProductCreateData {
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

export interface ProductCreateResult {
  id: number;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Registra un producto vía POST /products.
 * Fake Store API no persiste el artículo; responderá con un nuevo ID
 * (objeto completo o solo {id}).
 */
export async function createProduct(
  data: ProductCreateData,
  signal?: AbortSignal,
): Promise<ProductCreateResult> {
  let response: Response;
  try {
    response = await fetch(FAKE_STORE_PRODUCTS_URL, {
      method: 'POST',
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

  if (!isRecordObject(json) || typeof json.id !== 'number' || json.id <= 0) {
    throw new ProductServiceError('La respuesta no contiene el nuevo producto registrado.');
  }

  return {
    id: json.id,
    title: typeof json.title === 'string' ? json.title : data.title,
    price: typeof json.price === 'number' ? json.price : data.price,
    description: typeof json.description === 'string' ? json.description : data.description,
    image: typeof json.image === 'string' ? json.image : data.image,
    category: typeof json.category === 'string' ? json.category : data.category,
  };
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
    return json.map((item) => aplicarEdicionLocal(Product.fromJson(item)));
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
    return json.map((item) => aplicarEdicionLocal(Product.fromJson(item)));
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
    return aplicarEdicionLocal(Product.fromJson(json));
  } catch {
    throw new ProductServiceError('Los datos recibidos no se pudieron interpretar.');
  }
}

/**
 * Actualiza un producto vía PUT /products/{id} (US07).
 *
 * Restricción de seguridad de dos niveles:
 *  - Nivel 1 (UI): el formulario solo se muestra al rol Administrador.
 *  - Nivel 2 (servicio): se verifica el rol antes de realizar el fetch.
 *
 * Fake Store API no persiste los cambios (simulación), por lo que la
 * edición se conserva en la caché local para el resto de la sesión.
 */
export async function updateProduct(
  id: number,
  data: ProductUpdateData,
  rol: string,
  signal?: AbortSignal,
): Promise<Product | null> {
  if (!isValidPositiveId(id)) {
    throw new ProductServiceError('ID de producto inválido.');
  }

  if (rol !== ROL_ADMINISTRADOR) {
    throw new ProductServiceError('No autorizado. Solo el rol Administrador puede editar productos.');
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

  // La API solo simula la actualización: se conserva localmente.
  edicionesLocales.set(id, { ...data });

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ProductServiceError('La respuesta del servidor no es válida.');
  }

  try {
    return aplicarEdicionLocal(Product.fromJson(json));
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

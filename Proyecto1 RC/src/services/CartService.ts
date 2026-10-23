/**
 * Servicio HTTP del carrito (US10).
 *
 * Extiende la capa de conexión existente (ApiClient) para consumir los
 * endpoints reales de Fake Store API:
 *   GET    /carts
 *   GET    /carts/{id}
 *   POST   /carts
 *   PUT    /carts/{id}
 *   DELETE /carts/{id}
 *
 * Fake Store API no conserva los cambios de escritura. El servicio solo
 * simula la operación remota; el estado local del carrito sigue siendo la
 * fuente inmediata de verdad.
 */

import { CarritoApi, CarritoApiItem } from '../model/Carrito';
import { ApiClient } from './ApiClient';
import { ErrorAmigable } from './ErrorAmigable';

// #################### US10: Operaciones del carrito ####################
export class CartService {
  constructor(private readonly api: ApiClient) {}

  /** GET /carts/{id} */
  async obtenerCarrito(carritoId: number, userId: number): Promise<CarritoApi> {
    validarIdCarrito(carritoId);
    try {
      const json = await this.api.request<unknown>(`/carts/${carritoId}`);
      return normalizarCarrito(json, {
        id: carritoId,
        userId,
        date: new Date().toISOString(),
        products: [],
      });
    } catch (error) {
      throw comoErrorAmigable(error, 'No se pudo cargar el carrito. Inténtalo nuevamente.');
    }
  }

  /** GET /carts y selecciona el carrito del usuario autenticado. */
  async buscarCarritoDeUsuario(userId: number): Promise<CarritoApi | null> {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new ErrorAmigable('No se pudo identificar al usuario del carrito.');
    }

    try {
      const json = await this.api.request<unknown>('/carts');
      if (!Array.isArray(json)) {
        throw new ErrorAmigable('La lista de carritos recibida no es válida.');
      }

      const carritos = json.map((item, indice) =>
        normalizarCarrito(item, {
          id: indice + 1,
          userId,
          date: new Date().toISOString(),
          products: [],
        }),
      );
      const delUsuario = carritos.filter((carrito) => carrito.userId === userId);
      if (delUsuario.length === 0) {
        return null;
      }
      return delUsuario.reduce((ultimo, carrito) => (carrito.id > ultimo.id ? carrito : ultimo));
    } catch (error) {
      throw comoErrorAmigable(error, 'No se pudo consultar el carrito del usuario.');
    }
  }

  /** POST /carts: se usa cuando el usuario aún no tiene un carrito remoto. */
  async crearCarrito(
    userId: number,
    date: string,
    products: CarritoApiItem[],
  ): Promise<CarritoApi> {
    try {
      const json = await this.api.request<unknown>('/carts', {
        method: 'POST',
        body: { userId, date, products },
      });
      return normalizarCarrito(json, { id: 0, userId, date, products });
    } catch (error) {
      throw comoErrorAmigable(error, 'No se pudo crear el carrito en el servidor.');
    }
  }

  /** PUT /carts/{id}: actualiza el arreglo completo de productos del carrito. */
  async actualizarCarrito(
    carritoId: number,
    userId: number,
    date: string,
    products: CarritoApiItem[],
  ): Promise<CarritoApi> {
    validarIdCarrito(carritoId);
    try {
      const json = await this.api.request<unknown>(`/carts/${carritoId}`, {
        method: 'PUT',
        body: { userId, date, products },
      });
      return normalizarCarrito(json, { id: carritoId, userId, date, products });
    } catch (error) {
      throw comoErrorAmigable(error, 'No se pudieron guardar los cambios del carrito.');
    }
  }

  /**
   * DELETE /carts/{id}: elimina el recurso completo del carrito. Se usa
   * cuando el último artículo se quita, no para simular un borrado parcial
   * (para eso el contrato de Fake Store exige PUT con el arreglo restante).
   */
  async eliminarCarrito(carritoId: number): Promise<void> {
    validarIdCarrito(carritoId);
    try {
      await this.api.requestVoid(`/carts/${carritoId}`, { method: 'DELETE' });
    } catch (error) {
      throw comoErrorAmigable(error, 'No se pudo eliminar el carrito en el servidor.');
    }
  }
}
// #################################### Fin de US10 ####################################

function validarIdCarrito(carritoId: number): void {
  if (!Number.isInteger(carritoId) || carritoId <= 0) {
    throw new ErrorAmigable('El identificador del carrito no es válido.');
  }
}

function comoErrorAmigable(error: unknown, mensaje: string): ErrorAmigable {
  if (error instanceof ErrorAmigable) {
    return error;
  }
  return new ErrorAmigable(mensaje);
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function normalizarProductos(valor: unknown): CarritoApiItem[] {
  if (!Array.isArray(valor)) {
    throw new ErrorAmigable('Los productos del carrito recibidos no son válidos.');
  }

  return valor.map((item) => {
    if (!esRegistro(item)) {
      throw new ErrorAmigable('Un producto del carrito recibido no es válido.');
    }
    const { productId, quantity } = item;
    if (
      typeof productId !== 'number' ||
      !Number.isInteger(productId) ||
      productId <= 0 ||
      typeof quantity !== 'number' ||
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new ErrorAmigable('Un producto del carrito recibido no es válido.');
    }
    return { productId, quantity };
  });
}

/**
 * Valida y normaliza la respuesta del carrito. Los campos ausentes se
 * completan con el contrato local conocido (Fake Store puede devolver solo
 * el objeto actualizado sin todos los campos).
 */
function normalizarCarrito(valor: unknown, respaldo: CarritoApi): CarritoApi {
  if (!esRegistro(valor)) {
    throw new ErrorAmigable('La respuesta del carrito no es válida.');
  }

  const id = valor.id === undefined ? respaldo.id : valor.id;
  const userId = valor.userId === undefined ? respaldo.userId : valor.userId;
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new ErrorAmigable('La respuesta del carrito no contiene un identificador válido.');
  }
  if (typeof userId !== 'number' || !Number.isInteger(userId) || userId <= 0) {
    throw new ErrorAmigable('La respuesta del carrito no contiene un usuario válido.');
  }

  const date = typeof valor.date === 'string' ? valor.date : respaldo.date;
  const products =
    valor.products === undefined ? respaldo.products : normalizarProductos(valor.products);

  return { id, userId, date, products };
}

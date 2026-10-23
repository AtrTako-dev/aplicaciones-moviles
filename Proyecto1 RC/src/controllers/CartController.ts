/**
 * Controlador del carrito de compras (US10).
 *
 * Coordina la carga, el estado local, los cálculos, la persistencia y la
 * sincronización con Fake Store API. La interfaz nunca habla directamente con
 * el servicio HTTP ni duplica los cálculos de subtotales/total.
 *
 * Estrategia local-first:
 *  - Cada acción actualiza el arreglo local de inmediato.
 *  - El total se recalcula desde los artículos locales.
 *  - Las peticiones PUT/DELETE se serializan en una cola para evitar que dos
 *    operaciones rápidas dejen el estado inconsistente.
 *  - Si la API falla, se conserva el estado local y se informa el error.
 */

import { Carrito, CarritoApi, CarritoApiItem } from '../model/Carrito';
import { Product } from '../model/Product';
import { ErrorAmigable } from '../services/ErrorAmigable';

export type EstadoCarrito = 'inactivo' | 'cargando' | 'listo' | 'error';

export interface EstadoControladorCarrito {
  estado: EstadoCarrito;
  carrito: Carrito | null;
  errorCarga: string | null;
  errorOperacion: string | null;
  sincronizando: boolean;
  productosPendientes: number[];
}

export interface CartServicePort {
  buscarCarritoDeUsuario(userId: number): Promise<CarritoApi | null>;
  crearCarrito(userId: number, date: string, products: CarritoApiItem[]): Promise<CarritoApi>;
  actualizarCarrito(
    carritoId: number,
    userId: number,
    date: string,
    products: CarritoApiItem[],
  ): Promise<CarritoApi>;
  eliminarCarrito(carritoId: number): Promise<void>;
}

export interface CartProductPort {
  obtenerProductos(): Promise<Product[]>;
  obtenerProducto(id: number): Promise<Product>;
}

export interface CartStoragePort {
  guardar(userId: number, carrito: Carrito): Promise<void>;
  recuperar(userId: number): Promise<Carrito | null>;
  eliminar(userId: number): Promise<void>;
}

export interface CartControllerDependencias {
  userId: number;
  cartService: CartServicePort;
  productos: CartProductPort;
  storage: CartStoragePort;
}

type EscuchaEstado = (estado: EstadoControladorCarrito) => void;

const ESTADO_INICIAL: EstadoControladorCarrito = {
  estado: 'inactivo',
  carrito: null,
  errorCarga: null,
  errorOperacion: null,
  sincronizando: false,
  productosPendientes: [],
};

// #################### US10: Controlador local-first del carrito ####################
export class CartController {
  private estado: EstadoControladorCarrito = { ...ESTADO_INICIAL };
  private readonly escuchas = new Set<EscuchaEstado>();
  private colaSincronizacion: Promise<void> = Promise.resolve();
  private colaPersistencia: Promise<void> = Promise.resolve();
  private operacionesEnCurso = 0;
  private readonly pendientes = new Map<number, number>();
  private versionLocal = 0;
  private versionSincronizada = -1;
  private cargaEnCurso: Promise<void> | null = null;
  private activo = true;

  constructor(private readonly deps: CartControllerDependencias) {}

  getState(): EstadoControladorCarrito {
    return this.estado;
  }

  suscribir(escucha: EscuchaEstado): () => void {
    this.escuchas.add(escucha);
    return () => {
      this.escuchas.delete(escucha);
    };
  }

  dispose(): void {
    this.activo = false;
    this.escuchas.clear();
  }

  // #################### US10: Carga inicial del carrito ####################
  async cargar(forzar = false): Promise<void> {
    if (!forzar && this.estado.estado === 'listo') {
      return;
    }
    if (this.cargaEnCurso) {
      return this.cargaEnCurso;
    }

    this.cargaEnCurso = this.ejecutarCarga().finally(() => {
      this.cargaEnCurso = null;
    });
    return this.cargaEnCurso;
  }

  private async ejecutarCarga(): Promise<void> {
    this.emitir({ estado: 'cargando', errorCarga: null });
    try {
      // 1) La instantánea local del dispositivo tiene prioridad.
      const local = await this.deps.storage.recuperar(this.deps.userId);
      if (local && local.userId === this.deps.userId) {
        this.actualizarCarrito(local, { estado: 'listo', errorCarga: null });
        return;
      }

      // 2) Si no hay estado local, se consulta el carrito real del usuario.
      const remoto = await this.deps.cartService.buscarCarritoDeUsuario(this.deps.userId);
      if (!remoto) {
        const vacio = Carrito.vacio(0, this.deps.userId);
        this.actualizarCarrito(vacio, { estado: 'listo', errorCarga: null });
        return;
      }

      const catalogo = await this.deps.productos.obtenerProductos();
      const productosPorId = new Map(catalogo.map((product) => [product.id, product]));

      const faltantes = remoto.products
        .map((item) => item.productId)
        .filter((id) => !productosPorId.has(id));

      await Promise.all(
        [...new Set(faltantes)].map(async (id) => {
          const producto = await this.deps.productos.obtenerProducto(id);
          productosPorId.set(id, producto);
        }),
      );

      const carrito = Carrito.desdeApi(remoto, [...productosPorId.values()]);
      this.actualizarCarrito(carrito, { estado: 'listo', errorCarga: null });
    } catch (error) {
      this.emitir({
        estado: 'error',
        errorCarga: mensajeDeError(error, 'No se pudo cargar tu carrito. Inténtalo nuevamente.'),
      });
    }
  }
  // #################################### Fin de la carga ####################################

  // #################### US10: Modificación de cantidades ####################
  async agregar(product: Product, cantidad = 1): Promise<void> {
    await this.asegurarListo();
    this.aplicarCambioLocal(this.obtenerCarrito().agregar(product, cantidad));
    this.encolarSincronizacion(product.id);
  }

  async incrementar(productId: number): Promise<void> {
    await this.asegurarListo();
    const carrito = this.obtenerCarrito();
    if (!carrito.buscarItem(productId)) {
      return;
    }
    this.aplicarCambioLocal(carrito.incrementar(productId));
    this.encolarSincronizacion(productId);
  }

  async decrementar(productId: number): Promise<void> {
    await this.asegurarListo();
    const carrito = this.obtenerCarrito();
    if (!carrito.buscarItem(productId)) {
      return;
    }
    this.aplicarCambioLocal(carrito.decrementar(productId));
    this.encolarSincronizacion(productId);
  }

  async cambiarCantidad(productId: number, cantidad: number): Promise<void> {
    await this.asegurarListo();
    const carrito = this.obtenerCarrito();
    if (!carrito.buscarItem(productId)) {
      return;
    }
    this.aplicarCambioLocal(carrito.cambiarCantidad(productId, cantidad));
    this.encolarSincronizacion(productId);
  }
  // #################################### Fin de cantidades ####################################

  // #################### US10: Eliminación de artículos ####################
  async eliminar(productId: number): Promise<void> {
    await this.asegurarListo();
    const carrito = this.obtenerCarrito();
    if (!carrito.buscarItem(productId)) {
      return;
    }
    this.aplicarCambioLocal(carrito.eliminar(productId));
    this.encolarSincronizacion(productId);
  }
  // #################################### Fin de eliminación ####################################

  reintentarSincronizacion(): void {
    this.encolarSincronizacion();
  }

  limpiarErrorOperacion(): void {
    if (this.estado.errorOperacion) {
      this.emitir({ errorOperacion: null });
    }
  }

  /** Espera a que terminen la cola HTTP y la persistencia (útil en pruebas). */
  async esperarSincronizacion(): Promise<void> {
    await this.colaSincronizacion;
    await this.colaPersistencia;
  }

  private async asegurarListo(): Promise<void> {
    if (this.estado.estado === 'cargando' || this.estado.estado === 'inactivo') {
      await this.cargar();
    }
    if (this.estado.estado !== 'listo' || !this.estado.carrito) {
      throw new ErrorAmigable(
        this.estado.errorCarga ?? 'El carrito no está disponible en este momento.',
      );
    }
  }

  /**
   * Devuelve el carrito vigente después del await. Es importante leerlo en el
   * momento de aplicar el cambio (y no antes) para que dos acciones rápidas
   * consecutivas no partan de la misma instantánea y se pierda una de ellas.
   */
  private obtenerCarrito(): Carrito {
    if (this.estado.estado !== 'listo' || !this.estado.carrito) {
      throw new ErrorAmigable(
        this.estado.errorCarga ?? 'El carrito no está disponible en este momento.',
      );
    }
    return this.estado.carrito;
  }

  private aplicarCambioLocal(carrito: Carrito): void {
    this.versionLocal += 1;
    this.actualizarCarrito(carrito, { estado: 'listo', errorCarga: null, errorOperacion: null });
  }

  private actualizarCarrito(
    carrito: Carrito,
    cambios: Partial<EstadoControladorCarrito> = {},
  ): void {
    this.emitir({ ...cambios, carrito });
    this.persistir(carrito);
  }

  private persistir(carrito: Carrito): void {
    if (!this.activo) {
      return;
    }
    const instantanea = carrito;
    this.colaPersistencia = this.colaPersistencia
      .then(() => {
        if (!this.activo) {
          return;
        }
        return this.deps.storage.guardar(this.deps.userId, instantanea);
      })
      .catch(() => {
        this.emitir({
          errorOperacion: 'El carrito se actualizó en pantalla, pero no se pudo guardar en el dispositivo.',
        });
      });
  }

  // #################### US10: Sincronización serializada con la API ####################
  private encolarSincronizacion(productId?: number): void {
    this.operacionesEnCurso += 1;
    if (productId !== undefined) {
      this.pendientes.set(productId, (this.pendientes.get(productId) ?? 0) + 1);
    }
    this.emitirEstadoSincronizacion();

    const tarea = async () => {
      try {
        await this.sincronizarConRemoto();
      } catch (error) {
        this.emitir({
          errorOperacion: mensajeDeError(
            error,
            'No se pudo sincronizar el carrito con el servidor. Los cambios siguen en tu dispositivo.',
          ),
        });
      } finally {
        this.operacionesEnCurso = Math.max(0, this.operacionesEnCurso - 1);
        if (productId !== undefined) {
          const restantes = (this.pendientes.get(productId) ?? 1) - 1;
          if (restantes <= 0) {
            this.pendientes.delete(productId);
          } else {
            this.pendientes.set(productId, restantes);
          }
        }
        this.emitirEstadoSincronizacion();
      }
    };

    this.colaSincronizacion = this.colaSincronizacion.then(tarea, tarea);
  }

  private async sincronizarConRemoto(): Promise<void> {
    const version = this.versionLocal;
    if (version === this.versionSincronizada) {
      return;
    }

    const carrito = this.estado.carrito;
    if (!carrito) {
      return;
    }

    if (carrito.estaVacio) {
      if (carrito.id > 0) {
        // DELETE /carts/{id}: solo cuando el último artículo fue eliminado.
        await this.deps.cartService.eliminarCarrito(carrito.id);
        const actual = this.estado.carrito;
        if (actual) {
          // El carrito remoto ya no existe; un próximo agregado debe usar POST.
          this.actualizarCarrito(actual.conIdRemoto(0));
        }
      }
      this.versionSincronizada = version;
      return;
    }

    if (carrito.id > 0) {
      // PUT /carts/{id} con el arreglo completo de productos.
      await this.deps.cartService.actualizarCarrito(
        carrito.id,
        carrito.userId,
        carrito.date,
        carrito.aProductosApi(),
      );
    } else {
      // POST /carts cuando el usuario no tenía carrito remoto.
      const creado = await this.deps.cartService.crearCarrito(
        carrito.userId,
        carrito.date,
        carrito.aProductosApi(),
      );
      const actual = this.estado.carrito;
      if (actual) {
        this.actualizarCarrito(actual.conIdRemoto(creado.id, creado.date));
      }
    }

    this.versionSincronizada = version;
  }

  private emitirEstadoSincronizacion(): void {
    this.emitir({
      sincronizando: this.operacionesEnCurso > 0,
      productosPendientes: [...this.pendientes.keys()],
    });
  }

  private emitir(cambios: Partial<EstadoControladorCarrito>): void {
    if (!this.activo) {
      return;
    }
    this.estado = { ...this.estado, ...cambios };
    for (const escucha of this.escuchas) {
      escucha(this.estado);
    }
  }
  // #################################### Fin de la sincronización ####################################
}
// #################################### Fin de US10 ####################################

function mensajeDeError(error: unknown, respaldo: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return respaldo;
}

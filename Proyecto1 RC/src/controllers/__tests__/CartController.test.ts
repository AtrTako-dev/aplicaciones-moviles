import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { Carrito, CarritoApi, CarritoApiItem, ItemCarrito } from '../../model/Carrito';
import { Product } from '../../model/Product';
import {
  CartController,
  CartProductPort,
  CartServicePort,
  CartStoragePort,
} from '../CartController';

function producto(id: number, price: number, title = `Producto ${id}`): Product {
  return Product.fromJson({
    id,
    title,
    price,
    description: `Descripción ${id}`,
    category: 'test',
    image: `https://fake.img/${id}.png`,
    rating: { rate: 4.5, count: 10 },
  });
}

class FakeCartService implements CartServicePort {
  remoto: CarritoApi | null = null;
  errorBuscar: Error | null = null;
  errorActualizar: Error | null = null;
  errorEliminar: Error | null = null;
  actualizaciones: {
    carritoId: number;
    userId: number;
    date: string;
    products: CarritoApiItem[];
  }[] = [];
  eliminaciones: number[] = [];
  creaciones: { userId: number; date: string; products: CarritoApiItem[] }[] = [];
  llamadasBuscar = 0;

  async buscarCarritoDeUsuario(): Promise<CarritoApi | null> {
    this.llamadasBuscar += 1;
    if (this.errorBuscar) {
      throw this.errorBuscar;
    }
    return this.remoto;
  }

  async crearCarrito(
    userId: number,
    date: string,
    products: CarritoApiItem[],
  ): Promise<CarritoApi> {
    this.creaciones.push({ userId, date, products });
    return { id: 77, userId, date, products };
  }

  async actualizarCarrito(
    carritoId: number,
    userId: number,
    date: string,
    products: CarritoApiItem[],
  ): Promise<CarritoApi> {
    if (this.errorActualizar) {
      throw this.errorActualizar;
    }
    this.actualizaciones.push({ carritoId, userId, date, products });
    return { id: carritoId, userId, date, products };
  }

  async eliminarCarrito(carritoId: number): Promise<void> {
    if (this.errorEliminar) {
      throw this.errorEliminar;
    }
    this.eliminaciones.push(carritoId);
  }
}

class FakeProductProvider implements CartProductPort {
  catalogo: Product[] = [];

  async obtenerProductos(): Promise<Product[]> {
    return this.catalogo;
  }

  async obtenerProducto(id: number): Promise<Product> {
    const encontrado = this.catalogo.find((product) => product.id === id);
    if (!encontrado) {
      throw new Error(`Producto ${id} no disponible`);
    }
    return encontrado;
  }
}

class FakeStorage implements CartStoragePort {
  guardados: Carrito | null = null;
  local: Carrito | null = null;
  eliminados: number[] = [];

  async guardar(_userId: number, carrito: Carrito): Promise<void> {
    this.guardados = carrito;
    this.local = carrito;
  }

  async recuperar(): Promise<Carrito | null> {
    return this.local;
  }

  async eliminar(userId: number): Promise<void> {
    this.eliminados.push(userId);
    this.local = null;
  }
}

function construirControlador() {
  const cartService = new FakeCartService();
  const productos = new FakeProductProvider();
  const storage = new FakeStorage();
  const controller = new CartController({
    userId: 4,
    cartService,
    productos,
    storage,
  });

  return { controller, cartService, productos, storage };
}

function carritoRemoto(): CarritoApi {
  return {
    id: 6,
    userId: 4,
    date: '2020-03-01T00:00:00.000Z',
    products: [
      { productId: 10, quantity: 2 },
      { productId: 12, quantity: 3 },
    ],
  };
}

function catalogo(): Product[] {
  return [producto(10, 100, 'Producto A'), producto(12, 49.99, 'Producto B')];
}

describe('CartController - estado local y API (US10)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('carga el carrito remoto y relaciona cada productId con el catálogo', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = carritoRemoto();
    productos.catalogo = catalogo();

    await controller.cargar();
    const estado = controller.getState();

    expect(estado.estado).toBe('listo');
    expect(estado.carrito?.id).toBe(6);
    expect(estado.carrito?.items).toHaveLength(2);
    expect(estado.carrito?.items[0].product.title).toBe('Producto A');
    expect(estado.carrito?.totalFormateado).toBe('$349.97');
  });

  it('prioriza la instantánea local sobre el carrito remoto', async () => {
    const { controller, cartService, storage } = construirControlador();
    storage.local = new Carrito(
      6,
      4,
      [new ItemCarrito(producto(10, 100), 1)],
      '2020-03-01T00:00:00.000Z',
    );
    cartService.remoto = carritoRemoto();

    await controller.cargar();

    expect(cartService.llamadasBuscar).toBe(0);
    expect(controller.getState().carrito?.cantidadDe(10)).toBe(1);
    expect(controller.getState().carrito?.totalFormateado).toBe('$100.00');
  });

  it('incrementa la cantidad de inmediato y envía PUT con el arreglo actualizado', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = carritoRemoto();
    productos.catalogo = catalogo();
    await controller.cargar();

    await controller.incrementar(10);
    await controller.esperarSincronizacion();
    const estado = controller.getState();

    expect(estado.carrito?.cantidadDe(10)).toBe(3);
    expect(estado.carrito?.cantidadDe(12)).toBe(3);
    expect(estado.carrito?.totalFormateado).toBe('$449.97');
    expect(cartService.actualizaciones).toHaveLength(1);
    expect(cartService.actualizaciones[0]).toEqual(
      expect.objectContaining({
        carritoId: 6,
        userId: 4,
        products: [
          { productId: 10, quantity: 3 },
          { productId: 12, quantity: 3 },
        ],
      }),
    );
  });

  it('decrementa la cantidad y conserva los productos no modificados', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = carritoRemoto();
    productos.catalogo = catalogo();
    await controller.cargar();

    await controller.decrementar(10);
    await controller.esperarSincronizacion();

    expect(controller.getState().carrito?.cantidadDe(10)).toBe(1);
    expect(controller.getState().carrito?.cantidadDe(12)).toBe(3);
    expect(controller.getState().carrito?.totalFormateado).toBe('$249.97');
    expect(cartService.actualizaciones[0].products).toEqual([
      { productId: 10, quantity: 1 },
      { productId: 12, quantity: 3 },
    ]);
  });

  it('elimina un artículo cuando la cantidad llega a cero y hace PUT si quedan otros', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = carritoRemoto();
    productos.catalogo = catalogo();
    await controller.cargar();

    await controller.decrementar(10);
    await controller.decrementar(10);
    await controller.esperarSincronizacion();

    expect(controller.getState().carrito?.buscarItem(10)).toBeUndefined();
    expect(controller.getState().carrito?.cantidadDe(12)).toBe(3);
    expect(controller.getState().carrito?.totalFormateado).toBe('$149.97');
    expect(cartService.actualizaciones.at(-1)?.products).toEqual([
      { productId: 12, quantity: 3 },
    ]);
  });

  it('elimina solo el artículo seleccionado desde el botón de eliminar', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = carritoRemoto();
    productos.catalogo = catalogo();
    await controller.cargar();

    await controller.eliminar(12);
    await controller.esperarSincronizacion();

    expect(controller.getState().carrito?.cantidadDe(10)).toBe(2);
    expect(controller.getState().carrito?.buscarItem(12)).toBeUndefined();
    expect(controller.getState().carrito?.totalFormateado).toBe('$200.00');
    expect(cartService.actualizaciones.at(-1)?.products).toEqual([
      { productId: 10, quantity: 2 },
    ]);
  });

  it('envía DELETE /carts/{id} al eliminar el último artículo y deja el total en $0.00', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = {
      id: 6,
      userId: 4,
      date: '2020-03-01T00:00:00.000Z',
      products: [{ productId: 10, quantity: 1 }],
    };
    productos.catalogo = [producto(10, 100, 'Producto A')];
    await controller.cargar();

    await controller.eliminar(10);
    await controller.esperarSincronizacion();

    expect(controller.getState().carrito?.estaVacio).toBe(true);
    expect(controller.getState().carrito?.totalFormateado).toBe('$0.00');
    expect(cartService.eliminaciones).toEqual([6]);
    expect(cartService.actualizaciones).toHaveLength(0);
  });

  it('mantiene los cambios locales y reporta el error si falla el PUT', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = carritoRemoto();
    productos.catalogo = catalogo();
    cartService.errorActualizar = new Error('Sin conexión');
    await controller.cargar();

    await controller.incrementar(10);
    await controller.esperarSincronizacion();

    expect(controller.getState().carrito?.cantidadDe(10)).toBe(3);
    expect(controller.getState().errorOperacion).toBe('Sin conexión');
    expect(controller.getState().sincronizando).toBe(false);
  });

  it('mantiene los cambios locales y reporta el error si falla el DELETE', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = {
      id: 6,
      userId: 4,
      date: '2020-03-01T00:00:00.000Z',
      products: [{ productId: 10, quantity: 1 }],
    };
    productos.catalogo = [producto(10, 100, 'Producto A')];
    cartService.errorEliminar = new Error('Servidor no disponible');
    await controller.cargar();

    await controller.eliminar(10);
    await controller.esperarSincronizacion();

    expect(controller.getState().carrito?.estaVacio).toBe(true);
    expect(controller.getState().errorOperacion).toBe('Servidor no disponible');
  });

  it('crea un carrito remoto al agregar un producto cuando no existía', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = null;
    productos.catalogo = catalogo();
    await controller.cargar();

    expect(controller.getState().carrito?.id).toBe(0);
    await controller.agregar(producto(10, 100, 'Producto A'), 2);
    await controller.esperarSincronizacion();

    expect(cartService.creaciones).toHaveLength(1);
    expect(controller.getState().carrito?.id).toBe(77);
    expect(controller.getState().carrito?.totalFormateado).toBe('$200.00');
  });

  it('mantiene el total consistente con incrementos rápidos', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = carritoRemoto();
    productos.catalogo = catalogo();
    await controller.cargar();

    await Promise.all([controller.incrementar(10), controller.incrementar(10)]);
    await controller.esperarSincronizacion();

    expect(controller.getState().carrito?.cantidadDe(10)).toBe(4);
    expect(controller.getState().carrito?.totalFormateado).toBe('$549.97');
    expect(cartService.actualizaciones.at(-1)?.products).toEqual([
      { productId: 10, quantity: 4 },
      { productId: 12, quantity: 3 },
    ]);
  });

  it('no permite cantidades negativas al decrementar por debajo de uno', async () => {
    const { controller, cartService, productos } = construirControlador();
    cartService.remoto = {
      id: 6,
      userId: 4,
      date: '2020-03-01T00:00:00.000Z',
      products: [{ productId: 10, quantity: 1 }],
    };
    productos.catalogo = [producto(10, 100, 'Producto A')];
    await controller.cargar();

    await controller.decrementar(10);
    await controller.decrementar(10);
    await controller.esperarSincronizacion();

    expect(controller.getState().carrito?.items.every((item) => item.cantidad > 0)).toBe(true);
    expect(controller.getState().carrito?.totalCentavos).toBe(0);
  });

  it('expone un estado de error si no puede cargar el carrito', async () => {
    const { controller, cartService } = construirControlador();
    cartService.errorBuscar = new Error('No hay red');
    await controller.cargar();

    expect(controller.getState().estado).toBe('error');
    expect(controller.getState().errorCarga).toBe('No hay red');
  });

  it('persiste cada cambio del carrito en el almacenamiento local', async () => {
    const { controller, cartService, productos, storage } = construirControlador();
    cartService.remoto = carritoRemoto();
    productos.catalogo = catalogo();
    await controller.cargar();

    await controller.incrementar(10);
    await controller.esperarSincronizacion();

    expect(storage.guardados?.cantidadDe(10)).toBe(3);
    expect(storage.guardados?.totalFormateado).toBe('$449.97');
  });
});

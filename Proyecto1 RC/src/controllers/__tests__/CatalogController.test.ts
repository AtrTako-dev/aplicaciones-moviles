import { describe, expect, it } from '@jest/globals';
import { Producto } from '../../model/Producto';
import { ErrorAmigable } from '../../services/ErrorAmigable';
import { CatalogController } from '../CatalogController';

class FakeProductService {
  llamadas: string[] = [];
  error: Error | null = null;

  productos: Producto[] = [];
  categorias: string[] = [];

  async obtenerProductos(): Promise<Producto[]> {
    this.llamadas.push('obtenerProductos');
    if (this.error) {
      throw this.error;
    }
    return this.productos;
  }

  async obtenerCategorias(): Promise<string[]> {
    this.llamadas.push('obtenerCategorias');
    if (this.error) {
      throw this.error;
    }
    return this.categorias;
  }

  async obtenerProductosPorCategoria(categoria: string): Promise<Producto[]> {
    this.llamadas.push(`obtenerProductosPorCategoria:${categoria}`);
    if (this.error) {
      throw this.error;
    }
    return this.productos.filter((p) => p.category === categoria);
  }
}

class FakeNetworkService {
  conectado = true;

  async verificarConexion(): Promise<void> {
    if (!this.conectado) {
      throw new ErrorAmigable(
        'Sin conexión a Internet. Verifica tu conexión e inténtalo nuevamente.',
      );
    }
  }
}

function producto(id: number, category: string): Producto {
  return {
    id,
    title: `Producto ${id}`,
    price: 10.5,
    description: 'Descripción',
    category,
    image: `https://fake.img/${id}.png`,
  };
}

function construirControlador(
  overrides: { conectado?: boolean; serviceError?: Error | null } = {},
) {
  const products = new FakeProductService();
  products.error = overrides.serviceError ?? null;
  const network = new FakeNetworkService();
  network.conectado = overrides.conectado ?? true;
  const controller = new CatalogController(
    products as never,
    network as never,
  );
  return { controller, products, network };
}

describe('CatalogController', () => {
  it('obtiene categorías y las delega al servicio', async () => {
    const { controller, products } = construirControlador();
    products.categorias = ['electronics', 'jewelery'];

    const categorias = await controller.obtenerCategorias();

    expect(categorias).toEqual(['electronics', 'jewelery']);
    expect(products.llamadas).toEqual(['obtenerCategorias']);
  });

  it('carga todos los productos cuando no hay categoría seleccionada', async () => {
    const { controller, products } = construirControlador();
    products.productos = [producto(1, 'electronics'), producto(2, 'jewelery')];

    const resultado = await controller.obtenerProductos(null);

    expect(resultado).toHaveLength(2);
    expect(products.llamadas).toEqual(['obtenerProductos']);
  });

  it('filtra productos por la categoría seleccionada', async () => {
    const { controller, products } = construirControlador();
    products.productos = [producto(1, 'electronics'), producto(3, 'electronics')];

    const resultado = await controller.obtenerProductos('electronics');

    expect(resultado).toEqual([producto(1, 'electronics'), producto(3, 'electronics')]);
    expect(products.llamadas).toEqual(['obtenerProductosPorCategoria:electronics']);
  });

  it('no consume la API cuando no hay conexión', async () => {
    const { controller, products } = construirControlador({ conectado: false });

    await expect(controller.obtenerProductos('electronics')).rejects.toThrow(
      'Sin conexión a Internet.',
    );
    await expect(controller.obtenerCategorias()).rejects.toThrow('Sin conexión a Internet.');
    expect(products.llamadas).toEqual([]);
  });

  it('propaga el error amigable del servicio', async () => {
    const { controller } = construirControlador({
      serviceError: new ErrorAmigable('No se pudo cargar el catálogo. Inténtalo nuevamente.'),
    });

    await expect(controller.obtenerProductos(null)).rejects.toThrow(
      'No se pudo cargar el catálogo.',
    );
  });
});
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Producto } from '../../model/Producto';
import { ApiClient } from '../ApiClient';
import { ProductService } from '../ProductService';

function crearRespuesta(status: number, cuerpo: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cuerpo,
  } as unknown as Response;
}

function producto(id: number, category: string): Producto {
  return {
    id,
    title: `Producto ${id}`,
    price: 10.5,
    description: `Descripción ${id}`,
    category,
    image: `https://fake.img/${id}.png`,
  };
}

describe('ProductService - Fake Store API', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('obtiene todos los productos desde /products', async () => {
    const esperados = [producto(1, 'electronics'), producto(2, 'jewelery')];
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(crearRespuesta(200, esperados));
    const service = new ProductService(new ApiClient());

    const productos = await service.obtenerProductos();

    expect(productos).toEqual(esperados);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://fakestoreapi.com/products',
      expect.any(Object),
    );
  });

  it('obtiene categorías dinámicas desde /products/categories', async () => {
    const categorias = ["men's clothing", 'jewelery', 'electronics', "women's clothing"];
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(crearRespuesta(200, categorias));
    const service = new ProductService(new ApiClient());

    const resultado = await service.obtenerCategorias();

    expect(resultado).toEqual(categorias);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://fakestoreapi.com/products/categories',
      expect.any(Object),
    );
  });

  it('obtiene productos por categoría con endpoint dinámico', async () => {
    const esperados = [producto(1, 'electronics'), producto(3, 'electronics')];
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(crearRespuesta(200, esperados));
    const service = new ProductService(new ApiClient());

    const productos = await service.obtenerProductosPorCategoria('electronics');

    expect(productos).toEqual(esperados);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://fakestoreapi.com/products/category/electronics',
      expect.any(Object),
    );
  });

  it('lanza mensaje amigable ante error HTTP 500', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(500, {}));
    const service = new ProductService(new ApiClient());

    await expect(service.obtenerProductos()).rejects.toThrow('Error en el servidor.');
  });

  it('lanza mensaje amigable ante error de red', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const service = new ProductService(new ApiClient());

    await expect(service.obtenerProductos()).rejects.toThrow('Error de red.');
  });

  it('lanza mensaje amigable ante HTTP 404 en categoría inexistente', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(404, []));
    const service = new ProductService(new ApiClient());

    await expect(service.obtenerProductosPorCategoria('inexistente')).rejects.toThrow(
      'Recurso no encontrado.',
    );
  });
});
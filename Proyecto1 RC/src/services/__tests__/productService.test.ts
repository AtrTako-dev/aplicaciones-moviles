import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from '../productService';

function crearRespuesta(status: number, cuerpo: unknown = {}): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cuerpo,
  } as unknown as Response;
}

const PRODUCTO_VALIDO = {
  id: 1,
  title: 'Vestido de verano',
  price: 55.99,
  description: 'Un vestido ligero',
  category: 'women clothing',
  image: 'https://example.com/vestido.jpg',
  rating: { rate: 4.2, count: 120 },
};

describe('productService - detalle (US05)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getProducts', () => {
    it('devuelve la lista de productos', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200, [PRODUCTO_VALIDO]));

      const products = await getProducts();

      expect(products).toHaveLength(1);
      expect(products[0].id).toBe(1);
      expect(products[0].formattedPrice).toBe('$55.99');
    });

    it('lanza error si la respuesta no es un arreglo', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(200, {}));

      await expect(getProducts()).rejects.toThrow('no contiene la lista');
    });
  });

  describe('getProductById', () => {
    it('obtiene un producto por id', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200, PRODUCTO_VALIDO));

      const product = await getProductById(1);

      expect(product.id).toBe(1);
      expect(product.title).toBe('Vestido de verano');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products/1',
        expect.any(Object),
      );
    });

    it('lanza error con id inválido sin hacer la petición', async () => {
      const fetchMock = jest.spyOn(global, 'fetch');

      await expect(getProductById(0)).rejects.toThrow('ID de producto inválido');
      await expect(getProductById(-5)).rejects.toThrow('ID de producto inválido');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('lanza error amigable cuando el producto no existe (404)', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(404));

      await expect(getProductById(999)).rejects.toThrow('El producto no existe');
    });

    it('lanza error ante respuesta no válida', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(200, { foo: 'bar' }));

      await expect(getProductById(1)).rejects.toThrow('no se pudieron interpretar');
    });

    it('lanza error amigable ante fallo de red', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(getProductById(1)).rejects.toThrow('No se pudo conectar');
    });
  });

  describe('updateProduct', () => {
    it('envía PUT y devuelve el producto actualizado', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200, PRODUCTO_VALIDO));

      const result = await updateProduct(1, {
        title: 'Nuevo título',
        price: 60,
        description: 'Descripción',
        category: 'categories',
      });

      expect(result?.id).toBe(1);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products/1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });

    it('lanza error con id inválido', async () => {
      await expect(
        updateProduct(-1, { title: 'x', price: 1, description: 'x', category: 'x' }),
      ).rejects.toThrow('ID de producto inválido');
    });

    it('lanza error ante HTTP de error', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(500));

      await expect(
        updateProduct(1, { title: 'x', price: 1, description: 'x', category: 'x' }),
      ).rejects.toThrow('estado HTTP 500');
    });
  });

  describe('deleteProduct', () => {
    it('envía DELETE y resuelve en éxito', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200));

      await expect(deleteProduct(3)).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products/3',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('lanza error con id inválido', async () => {
      await expect(deleteProduct(0)).rejects.toThrow('ID de producto inválido');
    });

    it('lanza error ante HTTP de error', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(404));

      await expect(deleteProduct(9)).rejects.toThrow('estado HTTP 404');
    });
  });
});
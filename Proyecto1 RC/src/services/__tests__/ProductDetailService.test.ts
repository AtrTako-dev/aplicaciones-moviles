import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  createProduct,
  deleteProduct,
  getProductCategories,
  getProductById,
  getProducts,
  getProductsByCategory,
  updateProduct,
} from '../ProductDetailService';

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

  describe('filtros de catálogo (US04)', () => {
    it('obtiene las categorías desde el endpoint correspondiente', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200, ['electronics', "men's clothing"]));

      await expect(getProductCategories()).resolves.toEqual(['electronics', "men's clothing"]);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products/categories',
        expect.any(Object),
      );
    });

    it('obtiene solo los productos de la categoría seleccionada', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200, [PRODUCTO_VALIDO]));

      await expect(getProductsByCategory('women clothing')).resolves.toHaveLength(1);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products/category/women%20clothing',
        expect.any(Object),
      );
    });

    it('restablece el catálogo general cuando no hay filtro', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200, [PRODUCTO_VALIDO]));

      await expect(getProductsByCategory('')).resolves.toHaveLength(1);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products',
        expect.any(Object),
      );
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

  describe('createProduct', () => {
    const DATOS_CREAR = {
      title: 'Nuevo artículo',
      price: 12.5,
      description: 'Descripción de prueba',
      image: 'https://example.com/nuevo.jpg',
      category: 'electronics',
    };

    it('envía POST a /products con el cuerpo y devuelve el producto creado', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200, { ...DATOS_CREAR, id: 21 }));

      const result = await createProduct(DATOS_CREAR);

      expect(result.id).toBe(21);
      expect(result.title).toBe('Nuevo artículo');
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(DATOS_CREAR),
        }),
      );
    });

    it('acepta una respuesta con solo el nuevo id', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(200, { id: 21 }));

      const result = await createProduct(DATOS_CREAR);

      expect(result.id).toBe(21);
      expect(result.title).toBe(DATOS_CREAR.title);
      expect(result.image).toBe(DATOS_CREAR.image);
    });

    it('lanza error amigable si la respuesta no contiene id', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(200, { foo: 'bar' }));

      await expect(createProduct(DATOS_CREAR)).rejects.toThrow('no contiene el nuevo producto');
    });

    it('lanza error amigable ante HTTP de error', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(500));

      await expect(createProduct(DATOS_CREAR)).rejects.toThrow('estado HTTP 500');
    });

    it('lanza error amigable ante fallo de red', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(createProduct(DATOS_CREAR)).rejects.toThrow('No se pudo conectar');
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

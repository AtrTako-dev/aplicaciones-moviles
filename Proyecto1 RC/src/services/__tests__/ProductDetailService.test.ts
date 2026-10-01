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

describe('productService - detalle y edición (US05/US07)', () => {
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

  describe('updateProduct (US07)', () => {
    it('envía PUT y devuelve el producto actualizado', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200, PRODUCTO_VALIDO));

      const result = await updateProduct(
        1,
        {
          title: 'Nuevo título',
          price: 60,
          description: 'Descripción',
          category: 'categories',
        },
        'Administrador',
      );

      expect(result?.id).toBe(1);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products/1',
        expect.objectContaining({ method: 'PUT' }),
      );
    });

    it('rechaza la edición si el rol no es Administrador sin hacer la petición', async () => {
      const fetchMock = jest.spyOn(global, 'fetch');

      await expect(
        updateProduct(
          1,
          { title: 'x', price: 1, description: 'x', category: 'x' },
          'Cliente',
        ),
      ).rejects.toThrow('No autorizado');

      await expect(
        updateProduct(
          1,
          { title: 'x', price: 1, description: 'x', category: 'x' },
          'Auditor',
        ),
      ).rejects.toThrow('No autorizado');

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('lanza error con id inválido', async () => {
      await expect(
        updateProduct(-1, { title: 'x', price: 1, description: 'x', category: 'x' }, 'Administrador'),
      ).rejects.toThrow('ID de producto inválido');
    });

    it('lanza error ante HTTP de error', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(500));

      await expect(
        updateProduct(1, { title: 'x', price: 1, description: 'x', category: 'x' }, 'Administrador'),
      ).rejects.toThrow('estado HTTP 500');
    });

    it('conserva la edición localmente porque la API simula la actualización', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          // Respuesta PUT sin rating: la simulación no devuelve el producto completo.
          crearRespuesta(200, {
            id: 99,
            title: 'Editado',
            price: 25,
            description: 'Descripción editada',
            category: 'nueva categoría',
          }),
        )
        .mockResolvedValueOnce(
          crearRespuesta(200, {
            ...PRODUCTO_VALIDO,
            id: 99,
            title: 'Original',
            price: 50,
            description: 'Descripción original',
            category: 'categoría original',
          }),
        );

      const result = await updateProduct(
        99,
        {
          title: 'Editado',
          price: 25,
          description: 'Descripción editada',
          category: 'nueva categoría',
        },
        'Administrador',
      );

      expect(result).toBeNull();

      const product = await getProductById(99);
      expect(product.title).toBe('Editado');
      expect(product.price).toBe(25);
      expect(product.description).toBe('Descripción editada');
      expect(product.category).toBe('nueva categoría');
    });

    it('lanza error y conserva la caché cuando el JSON de la respuesta es inválido', async () => {
      const respuestaJsonInválido = {
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON');
        },
      } as unknown as Response;

      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(respuestaJsonInválido)
        .mockResolvedValueOnce(
          crearRespuesta(200, {
            ...PRODUCTO_VALIDO,
            id: 55,
            title: 'Original',
            price: 40,
          }),
        );

      await expect(
        updateProduct(
          55,
          { title: 'Editado', price: 25, description: 'd', category: 'c' },
          'Administrador',
        ),
      ).rejects.toThrow('La respuesta del servidor no es válida');

      const product = await getProductById(55);
      expect(product.title).toBe('Original');
      expect(product.price).toBe(40);
    });

    it('lanza error y conserva la caché cuando la respuesta no corresponde a una actualización', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(crearRespuesta(200, { foo: 'bar' }))
        .mockResolvedValueOnce(
          crearRespuesta(200, {
            ...PRODUCTO_VALIDO,
            id: 65,
            title: 'Original',
          }),
        );

      await expect(
        updateProduct(
          65,
          { title: 'Editado', price: 25, description: 'd', category: 'c' },
          'Administrador',
        ),
      ).rejects.toThrow('no corresponde a una actualización válida');

      const product = await getProductById(65);
      expect(product.title).toBe('Original');
    });

    it('devuelve el producto completo aunque la simulación omita el rating si ya se consultó', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce(
          crearRespuesta(200, {
            ...PRODUCTO_VALIDO,
            id: 7,
            title: 'Original 7',
          }),
        )
        .mockResolvedValueOnce(
          crearRespuesta(200, {
            id: 7,
            title: 'Editado 7',
            price: 30,
            description: 'Descripción editada',
            category: 'categoría editada',
          }),
        );

      await getProductById(7);

      const result = await updateProduct(
        7,
        {
          title: 'Editado 7',
          price: 30,
          description: 'Descripción editada',
          category: 'categoría editada',
        },
        'Administrador',
      );

      expect(result).not.toBeNull();
      expect(result?.id).toBe(7);
      expect(result?.title).toBe('Editado 7');
      expect(result?.price).toBe(30);
      expect(result?.image).toBe(PRODUCTO_VALIDO.image);
      expect(result?.rating).toEqual(PRODUCTO_VALIDO.rating);
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

      const result = await createProduct(DATOS_CREAR, 'Administrador');

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

      const result = await createProduct(DATOS_CREAR, 'Administrador');

      expect(result.id).toBe(21);
      expect(result.title).toBe(DATOS_CREAR.title);
      expect(result.image).toBe(DATOS_CREAR.image);
    });

    it('lanza error amigable si la respuesta no contiene id', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(200, { foo: 'bar' }));

      await expect(createProduct(DATOS_CREAR, 'Administrador')).rejects.toThrow(
        'no contiene el nuevo producto',
      );
    });

    it('lanza error amigable ante HTTP de error', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(500));

      await expect(createProduct(DATOS_CREAR, 'Administrador')).rejects.toThrow('estado HTTP 500');
    });

    it('lanza error amigable ante fallo de red', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(createProduct(DATOS_CREAR, 'Administrador')).rejects.toThrow(
        'No se pudo conectar',
      );
    });

    it('bloquea el registro para roles no Administrador sin hacer fetch (seguridad)', async () => {
      const fetchMock = jest.spyOn(global, 'fetch');

      await expect(createProduct(DATOS_CREAR, 'Cliente')).rejects.toThrow('No autorizado');
      await expect(createProduct(DATOS_CREAR, 'Auditor')).rejects.toThrow('No autorizado');
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('deleteProduct (US08)', () => {
    it('envía DELETE y resuelve en éxito', async () => {
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(crearRespuesta(200));

      await expect(deleteProduct(3, 'Administrador')).resolves.toBeUndefined();
      expect(fetchMock).toHaveBeenCalledWith(
        'https://fakestoreapi.com/products/3',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('lanza error con id inválido', async () => {
      await expect(deleteProduct(0, 'Administrador')).rejects.toThrow('ID de producto inválido');
    });

    it('lanza error ante HTTP de error', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(404));

      await expect(deleteProduct(9, 'Administrador')).rejects.toThrow('estado HTTP 404');
    });

    it('bloquea el DELETE para roles no Administrador sin hacer fetch (seguridad)', async () => {
      const fetchMock = jest.spyOn(global, 'fetch');

      await expect(deleteProduct(3, 'Cliente')).rejects.toThrow('No autorizado');
      await expect(deleteProduct(3, 'Auditor')).rejects.toThrow('No autorizado');
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('prioriza el error de id inválido sobre el de rol', async () => {
      await expect(deleteProduct(0, 'Cliente')).rejects.toThrow('ID de producto inválido');
    });
  });
});

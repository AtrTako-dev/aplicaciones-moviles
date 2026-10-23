import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { CarritoApi } from '../../model/Carrito';
import { ApiClient } from '../ApiClient';
import { CartService } from '../CartService';

function crearRespuesta(status: number, cuerpo: unknown = {}): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cuerpo,
  } as unknown as Response;
}

const CARRITO: CarritoApi = {
  id: 6,
  userId: 4,
  date: '2020-03-01T00:00:00.000Z',
  products: [
    { productId: 10, quantity: 2 },
    { productId: 12, quantity: 3 },
  ],
};

describe('CartService - Fake Store API (US10)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('consulta los carritos y devuelve el del usuario autenticado', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      crearRespuesta(200, [
        { ...CARRITO, id: 1, userId: 1 },
        CARRITO,
      ]),
    );
    const service = new CartService(new ApiClient());

    const carrito = await service.buscarCarritoDeUsuario(4);

    expect(carrito).toEqual(CARRITO);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://fakestoreapi.com/carts',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('devuelve null cuando el usuario no tiene carrito remoto', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(crearRespuesta(200, [{ ...CARRITO, userId: 1 }]));
    const service = new CartService(new ApiClient());

    await expect(service.buscarCarritoDeUsuario(4)).resolves.toBeNull();
  });

  it('consulta un carrito por su identificador con GET /carts/{id}', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(crearRespuesta(200, CARRITO));
    const service = new CartService(new ApiClient());

    const carrito = await service.obtenerCarrito(6, 4);

    expect(carrito).toEqual(CARRITO);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://fakestoreapi.com/carts/6',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('actualiza el carrito con PUT /carts/{id} enviando userId, date y products', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(crearRespuesta(200, CARRITO));
    const service = new CartService(new ApiClient());

    const resultado = await service.actualizarCarrito(
      6,
      4,
      CARRITO.date,
      [{ productId: 10, quantity: 3 }, { productId: 12, quantity: 3 }],
    );

    const [url, opciones] = fetchMock.mock.calls[0];
    expect(url).toBe('https://fakestoreapi.com/carts/6');
    expect(opciones).toEqual(
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({
          userId: 4,
          date: CARRITO.date,
          products: [
            { productId: 10, quantity: 3 },
            { productId: 12, quantity: 3 },
          ],
        }),
      }),
    );
    expect(resultado.id).toBe(6);
  });

  it('elimina el carrito completo con DELETE /carts/{id}', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(200, CARRITO));
    const service = new CartService(new ApiClient());

    await service.eliminarCarrito(6);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://fakestoreapi.com/carts/6',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('crea un carrito con POST /carts cuando el usuario no tiene uno', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(crearRespuesta(201, { ...CARRITO, id: 11 }));
    const service = new CartService(new ApiClient());

    const creado = await service.crearCarrito(4, CARRITO.date, CARRITO.products);

    expect(creado.id).toBe(11);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://fakestoreapi.com/carts',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('rechaza un identificador de carrito inválido sin llamar a la API', async () => {
    const fetchMock = jest.spyOn(global, 'fetch');
    const service = new CartService(new ApiClient());

    await expect(service.eliminarCarrito(0)).rejects.toThrow('identificador del carrito');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('propaga un error HTTP del servidor', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(500, {}));
    const service = new CartService(new ApiClient());

    await expect(service.buscarCarritoDeUsuario(4)).rejects.toThrow('Error en el servidor');
  });

  it('propaga un error de red', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const service = new CartService(new ApiClient());

    await expect(
      service.actualizarCarrito(6, 4, CARRITO.date, CARRITO.products),
    ).rejects.toThrow('Error de red');
  });

  it('rechaza una respuesta de carrito con estructura inesperada', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(200, { id: 'seis' }));
    const service = new CartService(new ApiClient());

    await expect(service.obtenerCarrito(6, 4)).rejects.toThrow('identificador válido');
  });

  it('rechaza productos con cantidades negativas en la respuesta', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      crearRespuesta(200, {
        ...CARRITO,
        products: [{ productId: 10, quantity: -2 }],
      }),
    );
    const service = new CartService(new ApiClient());

    await expect(service.obtenerCarrito(6, 4)).rejects.toThrow('no es válido');
  });
});

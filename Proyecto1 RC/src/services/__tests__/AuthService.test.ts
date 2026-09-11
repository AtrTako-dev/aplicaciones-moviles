import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiClient } from '../ApiClient';
import { AuthService } from '../AuthService';

function crearRespuesta(status: number, cuerpo: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cuerpo,
  } as unknown as Response;
}

describe('AuthService - Fake Store API', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('inicia sesión y devuelve el token', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(crearRespuesta(200, { token: 'abc-123' }));
    const service = new AuthService(new ApiClient());

    const token = await service.login('johnd', 'm38rmF$');

    expect(token).toBe('abc-123');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://fakestoreapi.com/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'johnd', password: 'm38rmF$' }),
      }),
    );
  });

  it('lanza mensaje amigable con credenciales incorrectas (401)', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(401, {}));
    const service = new AuthService(new ApiClient());

    await expect(service.login('johnd', 'mala')).rejects.toThrow('Usuario o contraseña inválidos');
  });

  it('lanza mensaje amigable con HTTP 400', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(400, {}));
    const service = new AuthService(new ApiClient());

    await expect(service.login('johnd', 'mala')).rejects.toThrow('Usuario o contraseña inválidos');
  });

  it('lanza mensaje amigable ante error de red', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const service = new AuthService(new ApiClient());

    await expect(service.login('johnd', 'm38rmF$')).rejects.toThrow('Error de red.');
  });

  it('lanza mensaje amigable ante timeout', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));
    const service = new AuthService(new ApiClient());

    await expect(service.login('johnd', 'm38rmF$')).rejects.toThrow('La conexión tardó demasiado.');
  });

  it('lanza mensaje amigable ante error 500', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(500, {}));
    const service = new AuthService(new ApiClient());

    await expect(service.login('johnd', 'm38rmF$')).rejects.toThrow('Error en el servidor.');
  });

  it('lanza mensaje amigable ante HTTP 404', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(crearRespuesta(404, {}));
    const service = new AuthService(new ApiClient());

    await expect(service.login('johnd', 'm38rmF$')).rejects.toThrow('Recurso no encontrado.');
  });
});

import { describe, expect, it } from '@jest/globals';
import { ROLES } from '../../model/Rol';
import { Sesion } from '../../model/Sesion';
import { Usuario } from '../../model/Usuario';
import { ErrorAmigable } from '../../services/ErrorAmigable';
import { UsuarioAPI } from '../../services/UserService';
import { AuthController } from '../AuthController';

class FakeAuthService {
  llamadas = 0;
  error: Error | null = null;

  async login(username: string, _password: string): Promise<string> {
    this.llamadas += 1;
    if (this.error) {
      throw this.error;
    }
    return `token-de-${username}`;
  }
}

class FakeUserService {
  usuarios: UsuarioAPI[] = [];

  async obtenerUsuarios(): Promise<UsuarioAPI[]> {
    return this.usuarios;
  }

  buscarPorUsername(usuarios: UsuarioAPI[], username: string): UsuarioAPI {
    const usuario = usuarios.find((u) => u.username === username);
    if (!usuario) {
      throw new ErrorAmigable('No se encontró el usuario en el catálogo.');
    }
    return usuario;
  }
}

class FakeStorageService {
  sesionGuardada: Sesion | null = null;
  carritoLimpio = false;
  sesionEliminada = false;

  async guardarSesion(sesion: Sesion): Promise<void> {
    this.sesionGuardada = sesion;
  }

  async recuperarSesion(): Promise<Sesion | null> {
    return this.sesionGuardada;
  }

  async eliminarSesion(): Promise<void> {
    this.sesionEliminada = true;
  }

  async limpiarCarrito(): Promise<void> {
    this.carritoLimpio = true;
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

function usuarioDeApi(id: number, username: string, primer: string, apellido: string): UsuarioAPI {
  return {
    id,
    username,
    email: `${username}@fakestore.com`,
    name: { firstname: primer, lastname: apellido },
  };
}

function construirControlador(
  overrides: {
    users?: UsuarioAPI[];
    conectado?: boolean;
    authError?: Error | null;
  } = {},
) {
  const auth = new FakeAuthService();
  auth.error = overrides.authError ?? null;
  const users = new FakeUserService();
  users.usuarios = overrides.users ?? [];
  const storage = new FakeStorageService();
  const network = new FakeNetworkService();
  network.conectado = overrides.conectado ?? true;
  const controller = new AuthController({
    authService: auth,
    userService: users,
    storageService: storage,
    networkService: network,
  } as never);
  return { controller, auth, users, storage, network };
}

describe('AuthController - login', () => {
  it('inicia sesión exitosa con ID 1 y asigna Administrador', async () => {
    const { controller, storage } = construirControlador({
      users: [usuarioDeApi(1, 'johnd', 'John', 'Doe')],
    });

    const usuario = await controller.login('johnd', 'm38rmF$');

    expect(usuario).toBeInstanceOf(Usuario);
    expect(usuario.id).toBe(1);
    expect(usuario.nombre).toBe('John Doe');
    expect(usuario.rol).toBe(ROLES.ADMINISTRADOR);
    expect(storage.sesionGuardada).not.toBeNull();
    expect(storage.sesionGuardada?.token).toBe('token-de-johnd');
  });

  it('asigna Auditor a ID 3 y Cliente a IDs mayores', async () => {
    const { controller: auditor } = construirControlador({
      users: [usuarioDeApi(3, 'kevinryan', 'Kevin', 'Ryan')],
    });
    expect((await auditor.login('kevinryan', 'secret')).rol).toBe(ROLES.AUDITOR);

    const { controller: cliente } = construirControlador({
      users: [usuarioDeApi(4, 'donero', 'Dane', 'Roe')],
    });
    expect((await cliente.login('donero', 'secret')).rol).toBe(ROLES.CLIENTE);
  });

  it('no consume la API cuando no hay conexión', async () => {
    const { controller, auth, storage } = construirControlador({ conectado: false });

    await expect(controller.login('johnd', 'm38rmF$')).rejects.toThrow('Sin conexión a Internet.');
    expect(auth.llamadas).toBe(0);
    expect(storage.sesionGuardada).toBeNull();
  });

  it('no guarda sesión con credenciales incorrectas', async () => {
    const { controller, storage } = construirControlador({
      authError: new ErrorAmigable('Usuario o contraseña inválidos'),
    });

    await expect(controller.login('johnd', 'mala')).rejects.toThrow(
      'Usuario o contraseña inválidos',
    );
    expect(storage.sesionGuardada).toBeNull();
  });

  it('rechaza un usuario que no existe en el catálogo', async () => {
    const { controller } = construirControlador();

    await expect(controller.login('nadie', 'clave')).rejects.toThrow(
      'No se encontró el usuario en el catálogo.',
    );
  });
});

describe('AuthController - logout', () => {
  it('limpia el carrito y elimina la sesión', async () => {
    const { controller, storage } = construirControlador();

    await controller.logout();

    expect(storage.carritoLimpio).toBe(true);
    expect(storage.sesionEliminada).toBe(true);
  });
});

describe('AuthController - restaurarSesion', () => {
  it('restaura el usuario y su rol cuando existe sesión', async () => {
    const previo = new Sesion('token-viejo', new Usuario(2, 'mor_2314', 'Mor Stanley', 'm@x.com'));
    const { controller, storage } = construirControlador();
    storage.sesionGuardada = previo;

    const usuario = await controller.restaurarSesion();

    expect(usuario?.id).toBe(2);
    expect(usuario?.rol).toBe(ROLES.ADMINISTRADOR);
    expect(usuario?.username).toBe('mor_2314');
  });

  it('devuelve null sin sesión guardada', async () => {
    const { controller } = construirControlador();

    expect(await controller.restaurarSesion()).toBeNull();
  });
});

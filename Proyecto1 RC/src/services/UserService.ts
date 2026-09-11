import { ApiClient } from './ApiClient';
import { ErrorAmigable } from './ErrorAmigable';

export interface UsuarioAPI {
  id: number;
  email: string;
  username: string;
  name: {
    firstname: string;
    lastname: string;
  };
}

export class UserService {
  constructor(private readonly api: ApiClient) {}

  async obtenerUsuarios(): Promise<UsuarioAPI[]> {
    try {
      return await this.api.request<UsuarioAPI[]>('/users');
    } catch (error) {
      if (error instanceof ErrorAmigable) {
        throw error;
      }
      throw new ErrorAmigable(
        'No se pudieron obtener los datos del usuario. Inténtalo nuevamente.',
      );
    }
  }

  buscarPorUsername(usuarios: UsuarioAPI[], username: string): UsuarioAPI {
    const usuario = usuarios.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (!usuario) {
      throw new ErrorAmigable('No se encontró el usuario en el catálogo.');
    }
    return usuario;
  }
}

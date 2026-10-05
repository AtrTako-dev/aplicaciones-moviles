import { ApiClient } from './ApiClient';

export interface LoginResponse {
  token: string;
}

export class AuthService {
  constructor(private readonly api: ApiClient) {}

  // #################### US01: Autenticación con /auth/login ####################
  async login(username: string, password: string): Promise<string> {
    const respuesta = await this.api.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    return respuesta.token;
  }
  // ############################################ Fin de US01 ############################################
}

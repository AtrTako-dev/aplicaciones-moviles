import { ApiClient } from './ApiClient';

export interface LoginResponse {
  token: string;
}

export class AuthService {
  constructor(private readonly api: ApiClient) {}

  async login(username: string, password: string): Promise<string> {
    const respuesta = await this.api.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    return respuesta.token;
  }
}

import { ErrorAmigable } from './ErrorAmigable';

const TIEMPO_ESPERA_MS = 15000;

export interface Peticion {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export class ApiClient {
  private static readonly BASE_URL = 'https://fakestoreapi.com';

  // #################### US01, US03, US04 y US10: Transporte HTTP y errores comunes ####################
  async request<T>(endpoint: string, peticion: Peticion = {}): Promise<T> {
    const response = await this.ejecutar(endpoint, peticion);
    return (await response.json()) as T;
  }

  /**
   * Ejecuta una petición que no necesita leer el cuerpo de la respuesta
   * (por ejemplo DELETE /carts/{id}). Mantiene el mismo manejo de errores.
   */
  async requestVoid(endpoint: string, peticion: Peticion = {}): Promise<void> {
    await this.ejecutar(endpoint, peticion);
  }

  private async ejecutar(endpoint: string, peticion: Peticion): Promise<Response> {
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), TIEMPO_ESPERA_MS);
    let response: Response;
    try {
      response = await fetch(this.construirUrl(endpoint), {
        method: peticion.method ?? 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: peticion.body === undefined ? undefined : JSON.stringify(peticion.body),
        signal: controlador.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ErrorAmigable('La conexión tardó demasiado. Inténtalo nuevamente.');
      }
      throw new ErrorAmigable('Error de red. Verifica tu conexión e inténtalo nuevamente.');
    } finally {
      clearTimeout(timeout);
    }
    if (response.status === 400 || response.status === 401) {
      throw new ErrorAmigable('Usuario o contraseña inválidos');
    }
    if (response.status === 404) {
      throw new ErrorAmigable('Recurso no encontrado.');
    }
    if (response.status >= 500) {
      throw new ErrorAmigable('Error en el servidor. Inténtalo más tarde.');
    }
    if (!response.ok) {
      throw new ErrorAmigable('Ocurrió un error inesperado. Inténtalo nuevamente.');
    }
    return response;
  }
  // ################################ Fin de US01, US03, US04 y US10 ################################

  private construirUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return `${ApiClient.BASE_URL}${endpoint}`;
  }
}

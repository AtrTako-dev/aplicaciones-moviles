import { ErrorAmigable } from './ErrorAmigable';

const TIEMPO_ESPERA_MS = 15000;

interface Peticion {
  method?: 'GET' | 'POST';
  body?: unknown;
}

export class ApiClient {
  private static readonly BASE_URL = 'https://fakestoreapi.com';

  async request<T>(endpoint: string, peticion: Peticion = {}): Promise<T> {
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
    return (await response.json()) as T;
  }

  private construirUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    return `${ApiClient.BASE_URL}${endpoint}`;
  }
}

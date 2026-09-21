/**
 * Servicio de sesión local persistentada en AsyncStorage.
 *
 * US05 exige que el rol del usuario se obtenga estrictamente de la sesión
 * almacenada localmente, nunca de Fake Store API. Este servicio es la única
 * fuente de verdad para la autorización de la interfaz de detalle.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import { esRolValido, SesionLocal } from '../model/SesionLocal';
import { Rol } from '../model/Rol';

export interface SessionStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const SESSION_KEY = '@voz_urbana/session_local';

export class SessionService {
  constructor(private readonly storage: SessionStorage = AsyncStorage) {}

  /**
   * Persiste la sesión local con forma { user: { username, role } }.
   */
  async saveSession(username: string, role: Rol): Promise<void> {
    const sesion: SesionLocal = { user: { username, role } };
    await this.storage.setItem(SESSION_KEY, JSON.stringify(sesion));
  }

  /**
   * Recupera la sesión local. Devuelve null si no existe, está corrupta o
   * contiene un rol inválido (en cuyo caso no se otorgan permisos).
   */
  async getCurrentSession(): Promise<SesionLocal | null> {
    try {
      const raw = await this.storage.getItem(SESSION_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<SesionLocal>;
      if (!this.isValidSession(parsed)) {
        await this.clearSession();
        return null;
      }
      return parsed as SesionLocal;
    } catch {
      await this.clearSession();
      return null;
    }
  }

  /**
   * Devuelve solo el rol de la sesión actual, o null si no hay sesión válida.
   */
  async getCurrentRole(): Promise<Rol | null> {
    const sesion = await this.getCurrentSession();
    return sesion?.user?.role ?? null;
  }

  /**
   * Indica si la sesión actual pertenece a un administrador.
   */
  async isAdministrador(): Promise<boolean> {
    return (await this.getCurrentRole()) === 'Administrador';
  }

  async clearSession(): Promise<void> {
    try {
      await this.storage.removeItem(SESSION_KEY);
    } catch {
      // La sesión queda inaccesible aunque la limpieza falle.
    }
  }

  private isValidSession(value: Partial<SesionLocal>): boolean {
    return (
      typeof value?.user === 'object' &&
      value.user !== null &&
      typeof value.user.username === 'string' &&
      esRolValido(value.user.role)
    );
  }
}

export const sessionService = new SessionService();
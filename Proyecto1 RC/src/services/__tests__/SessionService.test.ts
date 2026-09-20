import { describe, expect, it } from '@jest/globals';
import { SessionStorage, SessionService } from '../SessionService';

class MemoryStorage implements SessionStorage {
  private readonly store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const SERVICE_KEY = '@voz_urbana/session_local';

describe('SessionService - sesión local (US05)', () => {
  it('guarda y recupera la sesión con forma { user: { username, role } }', async () => {
    const storage = new MemoryStorage();
    const service = new SessionService(storage);

    await service.saveSession('admin', 'Administrador');

    const session = await service.getCurrentSession();
    expect(session).toEqual({ user: { username: 'admin', role: 'Administrador' } });
  });

  it('devuelve null cuando nunca se guardó una sesión', async () => {
    const service = new SessionService(new MemoryStorage());

    expect(await service.getCurrentSession()).toBeNull();
  });

  it('descarta una sesión corrupta y limpia el almacenamiento', async () => {
    const storage = new MemoryStorage();
    await storage.setItem(SERVICE_KEY, 'no-es-json-valido');
    const service = new SessionService(storage);

    expect(await service.getCurrentSession()).toBeNull();
    expect(await storage.getItem(SERVICE_KEY)).toBeNull();
  });

  it('descarta una sesión con rol inválido (no admin, sin permisos)', async () => {
    const storage = new MemoryStorage();
    await storage.setItem(SERVICE_KEY, JSON.stringify({ user: { username: 'vago', role: 'Dios' } }));
    const service = new SessionService(storage);

    expect(await service.getCurrentSession()).toBeNull();
    expect(await service.isAdministrador()).toBe(false);
  });

  it('descarta una sesión sin user', async () => {
    const storage = new MemoryStorage();
    await storage.setItem(SERVICE_KEY, JSON.stringify({ foo: 'bar' }));
    const service = new SessionService(storage);

    expect(await service.getCurrentSession()).toBeNull();
  });

  it('expone el rol de la sesión actual', async () => {
    const storage = new MemoryStorage();
    const service = new SessionService(storage);
    await service.saveSession('ana', 'Cliente');

    expect(await service.getCurrentRole()).toBe('Cliente');
  });

  it('isAdministrador es true solo para el rol Administrador', async () => {
    const storage = new MemoryStorage();
    const service = new SessionService(storage);

    await service.saveSession('admin', 'Administrador');
    expect(await service.isAdministrador()).toBe(true);

    await service.saveSession('cliente', 'Cliente');
    expect(await service.isAdministrador()).toBe(false);

    await service.saveSession('auditor', 'Auditor');
    expect(await service.isAdministrador()).toBe(false);
  });

  it('limpia la sesión guardada', async () => {
    const storage = new MemoryStorage();
    const service = new SessionService(storage);
    await service.saveSession('admin', 'Administrador');

    await service.clearSession();

    expect(await service.getCurrentSession()).toBeNull();
  });
});
import { describe, expect, it } from '@jest/globals';
import { StoredUser } from '../../model/User';
import { SessionStorage, SessionController } from '../SessionController';

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

  raw(key: string): string | undefined {
    return this.store.get(key);
  }
}

const USER: StoredUser = { id: 1, name: 'Ana Torres', email: 'ana@ejemplo.com' };

function buildController(storage: MemoryStorage) {
  return new SessionController(storage);
}

describe('SessionController', () => {
  it('guarda una sesión y la recupera', async () => {
    const storage = new MemoryStorage();
    const controller = buildController(storage);

    await controller.saveSession(USER);

    const session = await controller.getSession();
    expect(session).toEqual(USER);
  });

  it('indica que existe una sesión activa', async () => {
    const storage = new MemoryStorage();
    const controller = buildController(storage);

    await controller.saveSession(USER);

    expect(await controller.hasSession()).toBe(true);
  });

  it('indica que no existe sesión cuando nunca se guardó', async () => {
    const storage = new MemoryStorage();
    const controller = buildController(storage);

    expect(await controller.hasSession()).toBe(false);
  });

  it('cierra la sesión eliminando los datos guardados', async () => {
    const storage = new MemoryStorage();
    const controller = buildController(storage);

    await controller.saveSession(USER);
    await controller.clearSession();

    expect(await controller.hasSession()).toBe(false);
    expect(await controller.getSession()).toBeNull();
  });

  it('recupera la sesión guardada previamente aunque la app se reinicie', async () => {
    const storage = new MemoryStorage();
    const firstController = buildController(storage);

    await firstController.saveSession(USER);

    const secondController = new SessionController(storage);
    expect(await secondController.getSession()).toEqual(USER);
  });

  it('descarta una sesión corrupta en el almacenamiento', async () => {
    const storage = new MemoryStorage();
    await storage.setItem('@voz_urbana/session', 'no-es-json-valido');
    const controller = buildController(storage);

    expect(await controller.getSession()).toBeNull();
    expect(await controller.hasSession()).toBe(false);
  });
});

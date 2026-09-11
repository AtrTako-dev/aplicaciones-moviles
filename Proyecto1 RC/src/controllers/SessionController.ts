import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredUser } from '../model/User';

export interface SessionStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const SESSION_KEY = '@voz_urbana/session';

export class SessionController {
  private currentUser: StoredUser | null = null;

  constructor(private readonly storage: SessionStorage = AsyncStorage) {}

  async saveSession(user: StoredUser): Promise<void> {
    await this.storage.setItem(SESSION_KEY, JSON.stringify(user));
    this.currentUser = user;
  }

  async getSession(): Promise<StoredUser | null> {
    if (this.currentUser) {
      return this.currentUser;
    }
    try {
      const raw = await this.storage.getItem(SESSION_KEY);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as Partial<StoredUser>;
      if (!this.isValidStoredUser(parsed)) {
        await this.clearSession();
        return null;
      }
      const user: StoredUser = {
        id: parsed.id as number,
        name: parsed.name as string,
        email: parsed.email as string,
      };
      this.currentUser = user;
      return user;
    } catch {
      await this.clearSession();
      return null;
    }
  }

  async hasSession(): Promise<boolean> {
    return (await this.getSession()) !== null;
  }

  async clearSession(): Promise<void> {
    try {
      await this.storage.removeItem(SESSION_KEY);
    } catch {
      this.currentUser = null;
      return;
    }
    this.currentUser = null;
  }

  private isValidStoredUser(value: Partial<StoredUser>): boolean {
    return (
      typeof value.id === 'number' &&
      typeof value.name === 'string' &&
      typeof value.email === 'string'
    );
  }
}

import * as SQLite from 'expo-sqlite';
import { Database } from './Database';
import { NewUserData, UserDao } from './UserDao';
import { UserRow } from '../model/User';

export class SqliteUserDao implements UserDao {
  constructor(private readonly database: Database) {}

  async insert(user: NewUserData): Promise<UserRow> {
    const db = await this.getDb();
    const result = await db.runAsync(
      'INSERT INTO users (name, email, passwordHash) VALUES (?, ?, ?)',
      user.name,
      user.email,
      user.passwordHash,
    );
    return {
      id: result.lastInsertRowId,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    };
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<UserRow>(
      'SELECT id, name, email, passwordHash FROM users WHERE email = ? LIMIT 1',
      email,
    );
    return row ?? null;
  }

  async emailExists(email: string): Promise<boolean> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM users WHERE email = ? LIMIT 1',
      email,
    );
    return row !== null && row.count > 0;
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    return this.database.open();
  }
}

import * as SQLite from 'expo-sqlite';

export class Database {
  private static instance: Database | null = null;
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly databaseName = 'voz_urbana.db';

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async open(): Promise<SQLite.SQLiteDatabase> {
    if (this.db) {
      return this.db;
    }
    const db = await SQLite.openDatabaseAsync(this.databaseName);
    await db.execAsync(
      'PRAGMA journal_mode = WAL;' +
        'CREATE TABLE IF NOT EXISTS users (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'name TEXT NOT NULL,' +
        'email TEXT NOT NULL UNIQUE,' +
        'passwordHash TEXT NOT NULL' +
        ');',
    );
    this.db = db;
    return db;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

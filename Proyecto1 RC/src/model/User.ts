export interface StoredUser {
  id: number;
  name: string;
  email: string;
}

export interface UserRow {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
}

export class User {
  private constructor(
    private readonly _id: number,
    private readonly _name: string,
    private readonly _email: string,
    private readonly _passwordHash: string,
  ) {}

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  toStoredUser(): StoredUser {
    return { id: this._id, name: this._name, email: this._email };
  }

  static create(id: number, name: string, email: string, passwordHash: string): User {
    return new User(id, name, email, passwordHash);
  }

  static fromRow(row: UserRow): User {
    return new User(row.id, row.name, row.email, row.passwordHash);
  }
}

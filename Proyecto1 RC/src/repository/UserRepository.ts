import { User, UserRow } from '../model/User';
import { UserModel } from '../model/UserModel';
import { UserDao } from '../database/UserDao';
import { PasswordHasher } from '../utils/security';

export type OperationResult<T> = { ok: true; data: T } | { ok: false; message: string };

export class UserRepository {
  constructor(
    private readonly dao: UserDao,
    private readonly hasher: PasswordHasher,
  ) {}

  async register(name: string, email: string, password: string): Promise<OperationResult<User>> {
    const normalizedEmail = this.normalizeEmail(email);
    const trimmedName = name.trim();

    const alreadyExists = await this.dao.emailExists(normalizedEmail);
    if (alreadyExists) {
      return { ok: false, message: 'El correo ya está registrado.' };
    }

    const passwordHash = await this.hasher.hashPassword(password);
    try {
      const row: UserRow = await this.dao.insert({
        name: trimmedName,
        email: normalizedEmail,
        passwordHash,
      });
      return { ok: true, data: User.fromRow(row) };
    } catch (error) {
      return { ok: false, message: this.toUserMessage(error) };
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.dao.findByEmail(this.normalizeEmail(email));
    return row ? User.fromRow(row) : null;
  }

  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    const userModel = new UserModel(user);
    const isValid = await userModel.verifyPassword(password, this.hasher);
    return isValid ? user : null;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toUserMessage(error: unknown): string {
    const details = error instanceof Error ? error.message : String(error);
    if (details.includes('UNIQUE constraint failed')) {
      return 'El correo ya está registrado.';
    }
    return 'Ocurrió un error al guardar los datos. Intenta de nuevo.';
  }
}

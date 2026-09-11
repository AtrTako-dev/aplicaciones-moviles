import { StoredUser, User } from './User';
import { PasswordHasher } from '../utils/security';

export class UserModel {
  constructor(private readonly user: User) {}

  get id(): number {
    return this.user.id;
  }

  get name(): string {
    return this.user.name;
  }

  get email(): string {
    return this.user.email;
  }

  async verifyPassword(password: string, hasher: PasswordHasher): Promise<boolean> {
    if (password.length === 0) {
      return false;
    }
    const candidate = await hasher.hashPassword(password);
    return candidate === this.user.passwordHash;
  }

  toStoredUser(): StoredUser {
    return this.user.toStoredUser();
  }
}

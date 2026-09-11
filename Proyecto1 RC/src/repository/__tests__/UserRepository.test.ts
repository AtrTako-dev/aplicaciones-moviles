import { describe, expect, it } from '@jest/globals';
import { UserRow } from '../../model/User';
import { NewUserData, UserDao } from '../../database/UserDao';
import { UserRepository } from '../UserRepository';
import { PasswordHasher } from '../../utils/security';

class FakeUserDao implements UserDao {
  private nextId = 1;
  readonly rows: UserRow[] = [];

  async insert(user: NewUserData): Promise<UserRow> {
    const row: UserRow = { id: this.nextId, ...user };
    this.nextId += 1;
    this.rows.push(row);
    return row;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    return this.rows.find((row) => row.email === email) ?? null;
  }

  async emailExists(email: string): Promise<boolean> {
    return this.rows.some((row) => row.email === email);
  }
}

class FakeHasher implements PasswordHasher {
  async hashPassword(password: string): Promise<string> {
    return `hash:${password}`;
  }
}

function buildRepository() {
  const dao = new FakeUserDao();
  const hasher = new FakeHasher();
  const repository = new UserRepository(dao, hasher);
  return { repository, dao };
}

describe('UserRepository - registro', () => {
  it('registra un usuario nuevo y devuelve sus datos', async () => {
    const { repository } = buildRepository();
    const result = await repository.register('Ana Torres', 'Ana@Ejemplo.com', 'clave123');

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.data.id).toBe(1);
    expect(result.data.name).toBe('Ana Torres');
    expect(result.data.email).toBe('ana@ejemplo.com');
    expect(result.data.passwordHash).toBe('hash:clave123');
  });

  it('detecta un correo duplicado', async () => {
    const { repository } = buildRepository();
    await repository.register('Ana Torres', 'ana@ejemplo.com', 'clave123');
    const second = await repository.register('Otro Usuario', 'ANA@ejemplo.com', 'clave456');

    expect(second.ok).toBe(false);
    if (second.ok) {
      return;
    }
    expect(second.message).toBe('El correo ya está registrado.');
  });
});

describe('UserRepository - credenciales', () => {
  it('valida credenciales correctas', async () => {
    const { repository } = buildRepository();
    await repository.register('Ana Torres', 'ana@ejemplo.com', 'clave123');

    const user = await repository.validateCredentials('ana@ejemplo.com', 'clave123');
    expect(user).not.toBeNull();
    expect(user?.email).toBe('ana@ejemplo.com');
  });

  it('rechaza credenciales con contraseña incorrecta', async () => {
    const { repository } = buildRepository();
    await repository.register('Ana Torres', 'ana@ejemplo.com', 'clave123');

    const user = await repository.validateCredentials('ana@ejemplo.com', 'clave-incorrecta');
    expect(user).toBeNull();
  });

  it('rechaza credenciales con correo inexistente', async () => {
    const { repository } = buildRepository();
    await repository.register('Ana Torres', 'ana@ejemplo.com', 'clave123');

    const user = await repository.validateCredentials('otro@ejemplo.com', 'clave123');
    expect(user).toBeNull();
  });
});

describe('UserRepository - búsqueda', () => {
  it('obtiene información del usuario por correo', async () => {
    const { repository } = buildRepository();
    await repository.register('Ana Torres', 'ana@ejemplo.com', 'clave123');

    const user = await repository.findByEmail('ANA@ejemplo.com');
    expect(user).not.toBeNull();
    expect(user?.name).toBe('Ana Torres');
  });

  it('devuelve null cuando el correo no existe', async () => {
    const { repository } = buildRepository();
    const user = await repository.findByEmail('nadie@ejemplo.com');
    expect(user).toBeNull();
  });
});

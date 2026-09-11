import { UserRow } from '../model/User';

export interface NewUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserDao {
  insert(user: NewUserData): Promise<UserRow>;
  findByEmail(email: string): Promise<UserRow | null>;
  emailExists(email: string): Promise<boolean>;
}

import * as Crypto from 'expo-crypto';

export interface PasswordHasher {
  hashPassword(password: string): Promise<string>;
}

export class CryptoPasswordHasher implements PasswordHasher {
  async hashPassword(password: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
  }
}

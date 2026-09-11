import { UserRepository } from '../repository/UserRepository';
import { FieldErrors, RegistrationInput, validateRegistrationInput } from '../utils/validators';

export type RegisterResult = { ok: true } | { ok: false; message: string };

export class RegisterController {
  constructor(private readonly repository: UserRepository) {}

  validate(input: RegistrationInput): FieldErrors {
    return validateRegistrationInput(input);
  }

  async register(input: RegistrationInput): Promise<RegisterResult> {
    const result = await this.repository.register(input.name, input.email, input.password);
    if (!result.ok) {
      return { ok: false, message: result.message };
    }
    return { ok: true };
  }
}

export const MIN_PASSWORD_LENGTH = 6;

export interface FieldErrors {
  [field: string]: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginCredentialsInput {
  username: string;
  password: string;
}

export interface RegistrationInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(email: string): string | null {
  const value = email.trim();
  if (value.length === 0) {
    return 'Ingresa tu correo.';
  }
  if (!EMAIL_PATTERN.test(value)) {
    return 'Ingresa un correo válido.';
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length === 0) {
    return 'Ingresa tu contraseña.';
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

export function validateName(name: string): string | null {
  if (name.trim().length === 0) {
    return 'Ingresa tu nombre.';
  }
  return null;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (confirmPassword.length === 0) {
    return 'Confirma tu contraseña.';
  }
  if (password !== confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }
  return null;
}

export function validateUsername(username: string): string | null {
  if (username.trim().length === 0) {
    return 'Ingresa tu usuario.';
  }
  return null;
}

export function validateLoginPassword(password: string): string | null {
  if (password.length === 0) {
    return 'Ingresa tu contraseña.';
  }
  return null;
}

export function validateLoginCredentials(input: LoginCredentialsInput): FieldErrors {
  const errors: FieldErrors = {};
  const usernameError = validateUsername(input.username);
  if (usernameError) {
    errors.username = usernameError;
  }
  const passwordError = validateLoginPassword(input.password);
  if (passwordError) {
    errors.password = passwordError;
  }
  return errors;
}

export function validateLoginInput(input: LoginInput): FieldErrors {
  const errors: FieldErrors = {};
  const emailError = validateEmail(input.email);
  if (emailError) {
    errors.email = emailError;
  }
  const passwordError = validatePassword(input.password);
  if (passwordError) {
    errors.password = passwordError;
  }
  return errors;
}

export function validateRegistrationInput(input: RegistrationInput): FieldErrors {
  const errors: FieldErrors = {};
  const nameError = validateName(input.name);
  if (nameError) {
    errors.name = nameError;
  }
  const emailError = validateEmail(input.email);
  if (emailError) {
    errors.email = emailError;
  }
  const passwordError = validatePassword(input.password);
  if (passwordError) {
    errors.password = passwordError;
  }
  const confirmError = validateConfirmPassword(input.password, input.confirmPassword);
  if (confirmError) {
    errors.confirmPassword = confirmError;
  }
  return errors;
}

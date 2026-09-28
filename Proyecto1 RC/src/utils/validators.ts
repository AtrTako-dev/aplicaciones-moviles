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
const URL_PATTERN = /^https?:\/\/[^\s/$.?#][^\s]*$/i;

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

export interface ProductFormInput {
  title: string;
  price: string;
  description: string;
  category: string;
}

export function validateProductTitle(title: string): string | null {
  if (title.trim().length === 0) {
    return 'El título es obligatorio';
  }
  return null;
}

export function validateProductPrice(price: string): string | null {
  const value = price.trim();
  if (value.length === 0) {
    return 'El precio es obligatorio';
  }
  const numero = Number(value);
  if (!Number.isFinite(numero)) {
    return 'El precio debe ser un número válido';
  }
  if (numero <= 0) {
    return 'El precio debe ser mayor que 0';
  }
  return null;
}

export function validateProductDescription(description: string): string | null {
  if (description.trim().length === 0) {
    return 'La descripción es obligatoria';
  }
  return null;
}

export function validateProductCategory(category: string): string | null {
  if (category.trim().length === 0) {
    return 'La categoría es obligatoria';
  }
  return null;
}

export function validateProductForm(input: ProductFormInput): FieldErrors {
  const errors: FieldErrors = {};
  const titleError = validateProductTitle(input.title);
  if (titleError) {
    errors.title = titleError;
  }
  const priceError = validateProductPrice(input.price);
  if (priceError) {
    errors.price = priceError;
  }
  const descriptionError = validateProductDescription(input.description);
  if (descriptionError) {
    errors.description = descriptionError;
  }
  const categoryError = validateProductCategory(input.category);
  if (categoryError) {
    errors.category = categoryError;
  }
  return errors;
}

export interface ProductCreateInput extends ProductFormInput {
  image: string;
}

export function validateProductImageUrl(image: string): string | null {
  const value = image.trim();
  if (value.length === 0) {
    return 'Ingresa la URL de la imagen.';
  }
  if (!URL_PATTERN.test(value)) {
    return 'Ingresa una URL válida de imagen.';
  }
  return null;
}

export function validateProductCreateForm(input: ProductCreateInput): FieldErrors {
  const errors = validateProductForm(input);
  const imageError = validateProductImageUrl(input.image);
  if (imageError) {
    errors.image = imageError;
  }
  return errors;
}

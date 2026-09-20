import { describe, expect, it } from '@jest/globals';
import {
  MIN_PASSWORD_LENGTH,
  validateConfirmPassword,
  validateEmail,
  validateLoginCredentials,
  validateLoginInput,
  validateName,
  validatePassword,
  validateProductForm,
  validateRegistrationInput,
} from '../validators';

describe('validateEmail', () => {
  it('acepta un correo correcto', () => {
    expect(validateEmail('usuario@ejemplo.com')).toBeNull();
  });

  it('acepta un correo correcto ignorando espacios', () => {
    expect(validateEmail('  usuario@ejemplo.com  ')).toBeNull();
  });

  it('rechaza un correo vacío', () => {
    expect(validateEmail('')).toBe('Ingresa tu correo.');
  });

  it('rechaza un correo sin arroba', () => {
    expect(validateEmail('usuarioejemplo.com')).toBe('Ingresa un correo válido.');
  });

  it('rechaza un correo sin dominio', () => {
    expect(validateEmail('usuario@')).toBe('Ingresa un correo válido.');
  });

  it('rechaza un correo inválido con espacios', () => {
    expect(validateEmail('usuario @ejemplo.com')).toBe('Ingresa un correo válido.');
  });
});

describe('validatePassword', () => {
  it('rechaza una contraseña vacía', () => {
    expect(validatePassword('')).toBe('Ingresa tu contraseña.');
  });

  it('rechaza una contraseña corta', () => {
    expect(validatePassword('12345')).toBe(
      `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    );
  });

  it('acepta una contraseña con la longitud mínima', () => {
    expect(validatePassword('123456')).toBeNull();
  });
});

describe('validateName', () => {
  it('rechaza un nombre vacío', () => {
    expect(validateName('')).toBe('Ingresa tu nombre.');
  });

  it('rechaza un nombre solo con espacios', () => {
    expect(validateName('   ')).toBe('Ingresa tu nombre.');
  });

  it('acepta un nombre válido', () => {
    expect(validateName('Ana Torres')).toBeNull();
  });
});

describe('validateConfirmPassword', () => {
  it('rechaza una confirmación vacía', () => {
    expect(validateConfirmPassword('clave123', '')).toBe('Confirma tu contraseña.');
  });

  it('rechaza contraseñas diferentes', () => {
    expect(validateConfirmPassword('clave123', 'clave124')).toBe('Las contraseñas no coinciden.');
  });

  it('acepta contraseñas iguales', () => {
    expect(validateConfirmPassword('clave123', 'clave123')).toBeNull();
  });
});

describe('validateLoginInput', () => {
  it('devuelve error de correo vacío', () => {
    const errors = validateLoginInput({ email: '', password: 'clave123' });
    expect(errors.email).toBe('Ingresa tu correo.');
    expect(errors.password).toBeUndefined();
  });

  it('devuelve error de contraseña vacía', () => {
    const errors = validateLoginInput({ email: 'a@b.com', password: '' });
    expect(errors.password).toBe('Ingresa tu contraseña.');
  });

  it('devuelve errores cuando ambos campos están vacíos', () => {
    const errors = validateLoginInput({ email: '', password: '' });
    expect(Object.keys(errors).sort()).toEqual(['email', 'password']);
  });

  it('no devuelve errores con datos válidos', () => {
    const errors = validateLoginInput({ email: 'a@b.com', password: 'clave123' });
    expect(errors).toEqual({});
  });
});

describe('validateLoginCredentials', () => {
  it('devuelve error de username vacío', () => {
    const errors = validateLoginCredentials({ username: '', password: 'clave123' });
    expect(errors.username).toBe('Ingresa tu usuario.');
    expect(errors.password).toBeUndefined();
  });

  it('devuelve error de contraseña vacía', () => {
    const errors = validateLoginCredentials({ username: 'johnd', password: '' });
    expect(errors.password).toBe('Ingresa tu contraseña.');
  });

  it('devuelve errores cuando ambos campos están vacíos', () => {
    const errors = validateLoginCredentials({ username: '', password: '' });
    expect(Object.keys(errors).sort()).toEqual(['password', 'username']);
  });

  it('no devuelve errores con credenciales válidas', () => {
    const errors = validateLoginCredentials({ username: 'johnd', password: 'm38rmF$' });
    expect(errors).toEqual({});
  });
});

describe('validateRegistrationInput', () => {
  it('devuelve errores cuando todo está vacío', () => {
    const errors = validateRegistrationInput({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    expect(Object.keys(errors).sort()).toEqual(['confirmPassword', 'email', 'name', 'password']);
  });

  it('no devuelve errores con datos válidos', () => {
    const errors = validateRegistrationInput({
      name: 'Ana Torres',
      email: 'ana@ejemplo.com',
      password: 'clave123',
      confirmPassword: 'clave123',
    });
    expect(errors).toEqual({});
  });
});

describe('validateProductTitle', () => {
  it('rechaza un título vacío', () => {
    expect(validateProductForm({ title: '', price: '10', description: 'd', category: 'c' }).title).toBe(
      'Ingresa el título del producto.',
    );
  });

  it('rechaza un título solo con espacios', () => {
    expect(validateProductForm({ title: '  ', price: '10', description: 'd', category: 'c' }).title).toBe(
      'Ingresa el título del producto.',
    );
  });

  it('acepta un título válido', () => {
    expect(validateProductForm({ title: 'Vestido', price: '10', description: 'd', category: 'c' })).toEqual({});
  });
});

describe('validateProductPrice', () => {
  it('rechaza un precio vacío', () => {
    expect(validateProductForm({ title: 't', price: '', description: 'd', category: 'c' }).price).toBe(
      'Ingresa el precio.',
    );
  });

  it('rechaza un precio no numérico', () => {
    expect(validateProductForm({ title: 't', price: 'abc', description: 'd', category: 'c' }).price).toBe(
      'Ingresa un precio válido.',
    );
  });

  it('rechaza un precio negativo', () => {
    expect(validateProductForm({ title: 't', price: '-5', description: 'd', category: 'c' }).price).toBe(
      'Ingresa un precio válido.',
    );
  });

  it('acepta un precio positivo con decimales', () => {
    expect(validateProductForm({ title: 't', price: '45.99', description: 'd', category: 'c' })).toEqual({});
  });

  it('acepta un precio igual a cero', () => {
    expect(validateProductForm({ title: 't', price: '0', description: 'd', category: 'c' })).toEqual({});
  });
});

describe('validateProductDescription', () => {
  it('rechaza una descripción vacía', () => {
    expect(
      validateProductForm({ title: 't', price: '10', description: '', category: 'c' }).description,
    ).toBe('Ingresa la descripción del producto.');
  });
});

describe('validateProductCategory', () => {
  it('rechaza una categoría vacía', () => {
    expect(
      validateProductForm({ title: 't', price: '10', description: 'd', category: '  ' }).category,
    ).toBe('Ingresa la categoría del producto.');
  });
});

describe('validateProductForm', () => {
  it('devuelve errores en todos los campos vacíos', () => {
    const errors = validateProductForm({ title: '', price: '', description: '', category: '' });
    expect(Object.keys(errors).sort()).toEqual(['category', 'description', 'price', 'title']);
  });

  it('no devuelve errores con datos válidos', () => {
    const errors = validateProductForm({
      title: 'Vestido de verano',
      price: '55.99',
      description: 'Ligero y fresco.',
      category: 'women clothing',
    });
    expect(errors).toEqual({});
  });
});

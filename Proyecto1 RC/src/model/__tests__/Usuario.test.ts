import { describe, expect, it } from '@jest/globals';
import { ROLES } from '../Rol';
import { Sesion } from '../Sesion';
import { Usuario } from '../Usuario';

describe('Usuario - asignación de rol por ID', () => {
  it.each([
    [1, ROLES.ADMINISTRADOR],
    [2, ROLES.ADMINISTRADOR],
    [3, ROLES.AUDITOR],
    [4, ROLES.CLIENTE],
    [20, ROLES.CLIENTE],
  ])('id %i => rol %s', (id, rolEsperado) => {
    expect(Usuario.getRolPorId(id)).toBe(rolEsperado);
    const usuario = new Usuario(id, 'user', 'Nombre', 'user@mail.com');
    expect(usuario.rol).toBe(rolEsperado);
  });
});

describe('Sesion - serialización', () => {
  it('almacena y restaura la sesión con el usuario y su rol', () => {
    const usuario = new Usuario(3, 'kevinryan', 'Kevin Ryan', 'kevin@mail.com');
    const sesion = new Sesion('token-xyz', usuario);

    const restaurada = Sesion.desdeJson(sesion.aJson());

    expect(restaurada.token).toBe('token-xyz');
    expect(restaurada.estado).toBe('activa');
    expect(restaurada.usuario.id).toBe(3);
    expect(restaurada.usuario.username).toBe('kevinryan');
    expect(restaurada.usuario.nombre).toBe('Kevin Ryan');
    expect(restaurada.usuario.email).toBe('kevin@mail.com');
    expect(restaurada.usuario.rol).toBe(ROLES.AUDITOR);
  });

  it('lanza error con una sesión corrupta', () => {
    expect(() => Sesion.desdeJson('{"token":"x"}')).toThrow();
  });
});

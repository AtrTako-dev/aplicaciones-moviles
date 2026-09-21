import { describe, expect, it } from '@jest/globals';
import { esRolValido, ROLES_VALIDOS } from '../SesionLocal';
import { ROLES } from '../Rol';

describe('SesionLocal - roles válidos (US05)', () => {
  it('acepta los tres roles válidos', () => {
    expect(esRolValido(ROLES.ADMINISTRADOR)).toBe(true);
    expect(esRolValido(ROLES.CLIENTE)).toBe(true);
    expect(esRolValido(ROLES.AUDITOR)).toBe(true);
  });

  it('rechaza roles inexistentes', () => {
    expect(esRolValido('Dios')).toBe(false);
    expect(esRolValido('admin')).toBe(false);
    expect(esRolValido('')).toBe(false);
  });

  it('rechaza valores que no son strings', () => {
    expect(esRolValido(null)).toBe(false);
    expect(esRolValido(undefined)).toBe(false);
    expect(esRolValido(1)).toBe(false);
    expect(esRolValido({})).toBe(false);
  });

  it('ROLES_VALIDOS contiene exactamente los tres roles', () => {
    expect([...ROLES_VALIDOS].sort()).toEqual(
      [ROLES.ADMINISTRADOR, ROLES.AUDITOR, ROLES.CLIENTE].sort(),
    );
    expect([...ROLES_VALIDOS]).toHaveLength(3);
  });
});
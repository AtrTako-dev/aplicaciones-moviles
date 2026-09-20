/**
 * Modelo de la sesión local persistentada en AsyncStorage.
 *
 * Estructura alineada con US05:
 * {
 *   "user": {
 *     "username": "admin",
 *     "role": "Administrador"
 *   }
 * }
 */

import { ROLES, Rol } from './Rol';

export interface SesionUsuarioLocal {
  username: string;
  role: Rol;
}

export interface SesionLocal {
  user: SesionUsuarioLocal;
}

export const ROLES_VALIDOS: readonly Rol[] = [
  ROLES.ADMINISTRADOR,
  ROLES.CLIENTE,
  ROLES.AUDITOR,
];

export function esRolValido(role: unknown): role is Rol {
  return typeof role === 'string' && (ROLES_VALIDOS as readonly string[]).includes(role);
}
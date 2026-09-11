export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  AUDITOR: 'Auditor',
  CLIENTE: 'Cliente',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

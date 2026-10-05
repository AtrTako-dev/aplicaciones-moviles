// #################### US01: Roles de acceso ###############################
export const ROLES = {
  ADMINISTRADOR: 'Administrador',
  AUDITOR: 'Auditor',
  CLIENTE: 'Cliente',
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];
// ############################ Fin de US01 ##################################

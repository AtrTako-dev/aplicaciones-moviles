import { Rol, ROLES } from './Rol';

export interface DatosUsuario {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export class Usuario {
  readonly rol: Rol;

  constructor(
    private readonly _id: number,
    private readonly _username: string,
    private readonly _nombre: string,
    private readonly _email: string,
  ) {
    this.rol = Usuario.getRolPorId(_id);
  }

  get id(): number {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get nombre(): string {
    return this._nombre;
  }

  get email(): string {
    return this._email;
  }

  static getRolPorId(id: number): Rol {
    if (id === 1 || id === 2) {
      return ROLES.ADMINISTRADOR;
    }
    if (id === 3) {
      return ROLES.AUDITOR;
    }
    return ROLES.CLIENTE;
  }

  toObject(): DatosUsuario {
    return {
      id: this._id,
      username: this._username,
      nombre: this._nombre,
      email: this._email,
      rol: this.rol,
    };
  }

  static desdeObject(data: DatosUsuario): Usuario {
    return new Usuario(data.id, data.username, data.nombre, data.email);
  }
}

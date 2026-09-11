import { DatosUsuario, Usuario } from './Usuario';

export interface SesionGuardada {
  token: string;
  usuario: DatosUsuario;
  fecha: string;
  estado: string;
}

export class Sesion {
  readonly fecha: string;
  readonly estado: string = 'activa';

  constructor(
    readonly token: string,
    readonly usuario: Usuario,
    fecha?: string,
  ) {
    this.fecha = fecha ?? new Date().toISOString();
  }

  aJson(): string {
    return JSON.stringify({
      token: this.token,
      usuario: this.usuario.toObject(),
      fecha: this.fecha,
      estado: this.estado,
    } satisfies SesionGuardada);
  }

  static desdeJson(raw: string): Sesion {
    const parsed = JSON.parse(raw) as Partial<SesionGuardada>;
    if (
      typeof parsed.token !== 'string' ||
      typeof parsed.fecha !== 'string' ||
      typeof parsed.estado !== 'string' ||
      !parsed.usuario ||
      typeof parsed.usuario.id !== 'number' ||
      typeof parsed.usuario.username !== 'string' ||
      typeof parsed.usuario.nombre !== 'string' ||
      typeof parsed.usuario.email !== 'string'
    ) {
      throw new Error('Sesión inválida.');
    }
    return new Sesion(parsed.token, Usuario.desdeObject(parsed.usuario), parsed.fecha);
  }
}

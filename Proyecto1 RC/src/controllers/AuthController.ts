import { Sesion } from '../model/Sesion';
import { Usuario } from '../model/Usuario';
import { AuthService } from '../services/AuthService';
import { NetworkService } from '../services/NetworkService';
import { StorageService } from '../services/StorageService';
import { UserService } from '../services/UserService';
import { FieldErrors, LoginCredentialsInput, validateLoginCredentials } from '../utils/validators';

export interface AuthControllerDependencias {
  authService: AuthService;
  userService: UserService;
  storageService: StorageService;
  networkService: NetworkService;
}

export class AuthController {
  constructor(private readonly dependencias: AuthControllerDependencias) {}

  // #################### US01: Validación, inicio y restauración de sesión ####################
  validate(input: LoginCredentialsInput): FieldErrors {
    return validateLoginCredentials(input);
  }

  async login(username: string, password: string): Promise<Usuario> {
    await this.dependencias.networkService.verificarConexion();
    const nombreUsuario = username.trim();
    const token = await this.dependencias.authService.login(nombreUsuario, password);
    const usuarios = await this.dependencias.userService.obtenerUsuarios();
    const datos = this.dependencias.userService.buscarPorUsername(usuarios, nombreUsuario);
    const nombre = `${datos.name.firstname} ${datos.name.lastname}`;
    const usuario = new Usuario(datos.id, datos.username, nombre, datos.email);
    const sesion = new Sesion(token, usuario);
    await this.dependencias.storageService.guardarSesion(sesion);
    return usuario;
  }

  async restaurarSesion(): Promise<Usuario | null> {
    try {
      const sesion = await this.dependencias.storageService.recuperarSesion();
      return sesion?.usuario ?? null;
    } catch {
      return null;
    }
  }
  // ############################################ Fin de US01 ############################################

  // #################### US02: Cierre de sesión y limpieza local ####################
  async logout(): Promise<void> {
    await this.dependencias.storageService.limpiarCarrito();
    await this.dependencias.storageService.eliminarSesion();
  }
  // ############################################ Fin de US02 ############################################
}

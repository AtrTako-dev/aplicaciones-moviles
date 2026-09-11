import NetInfo from '@react-native-community/netinfo';
import { ErrorAmigable } from './ErrorAmigable';

export class NetworkService {
  async verificarConexion(): Promise<void> {
    const conectado = await this.estaConectado();
    if (!conectado) {
      throw new ErrorAmigable(
        'Sin conexión a Internet. Verifica tu conexión e inténtalo nuevamente.',
      );
    }
  }

  async estaConectado(): Promise<boolean> {
    try {
      const estado = await NetInfo.fetch();
      return estado.isConnected !== false && estado.isInternetReachable !== false;
    } catch {
      // Without a reliable connectivity result, do not attempt an authenticated request.
      return false;
    }
  }
}

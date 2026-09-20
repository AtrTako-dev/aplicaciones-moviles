/**
 * Hook que expone la sesión local guardada en AsyncStorage.
 *
 * El rol obtenido de aquí es el que determina la interfaz dinámica
 * de US05. Nunca proviene de Fake Store API.
 */

import { useEffect, useState } from 'react';

import { SesionLocal } from '../model/SesionLocal';
import { sessionService } from '../services/SessionService';

export interface UseSesionLocalResult {
  sesion: SesionLocal | null;
  username: string | null;
  role: string | null;
  esAdministrador: boolean;
  cargando: boolean;
}

export function useSesionLocal(): UseSesionLocalResult {
  const [sesion, setSesion] = useState<SesionLocal | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    sessionService
      .getCurrentSession()
      .then((sesionActual) => {
        if (activo) {
          setSesion(sesionActual);
        }
      })
      .catch(() => {
        if (activo) {
          setSesion(null);
        }
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });
    return () => {
      activo = false;
    };
  }, []);

  return {
    sesion,
    username: sesion?.user?.username ?? null,
    role: sesion?.user?.role ?? null,
    esAdministrador: sesion?.user?.role === 'Administrador',
    cargando,
  };
}
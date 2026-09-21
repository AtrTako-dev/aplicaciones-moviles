import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Usuario } from '../model/Usuario';
import { authController } from '../config/AppContainer';
import { sessionService } from '../services/SessionService';

interface AuthState {
  usuario: Usuario | null;
  initializing: boolean;
  signIn: (usuario: Usuario) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;
    authController
      .restaurarSesion()
      .then(async (usuarioRestaurado) => {
        if (usuarioRestaurado) {
          await sessionService.saveSession(usuarioRestaurado.username, usuarioRestaurado.rol);
        }
        if (active) {
          setUsuario(usuarioRestaurado);
        }
      })
      .catch(() => {
        if (active) {
          setUsuario(null);
        }
      })
      .finally(() => {
        if (active) {
          setInitializing(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = async (nuevoUsuario: Usuario) => {
    try {
      await sessionService.saveSession(nuevoUsuario.username, nuevoUsuario.rol);
    } catch {
      // La sesión principal ya quedó guardada por el AuthController;
      // la sesión local es solo un refuerzo para la interfaz por rol.
    }
    setUsuario(nuevoUsuario);
  };

  const signOut = async () => {
    await sessionService.clearSession();
    await authController.logout();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, initializing, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider.');
  }
  return context;
}

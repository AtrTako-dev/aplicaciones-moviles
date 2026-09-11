import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Usuario } from '../model/Usuario';
import { authController } from '../config/AppContainer';

interface AuthState {
  usuario: Usuario | null;
  initializing: boolean;
  signIn: (usuario: Usuario) => void;
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
      .then((usuarioRestaurado) => {
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

  const signIn = (nuevoUsuario: Usuario) => {
    setUsuario(nuevoUsuario);
  };

  const signOut = async () => {
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

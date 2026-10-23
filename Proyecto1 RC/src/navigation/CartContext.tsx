/**
 * Contexto React del carrito (US10).
 *
 * Mantiene una única instancia del controlador por usuario autenticado para
 * que el catálogo, el detalle y la pantalla del carrito compartan el mismo
 * estado local de cantidades y totales.
 */

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';

import { crearCartController } from '../config/AppContainer';
import { CartController, EstadoControladorCarrito } from '../controllers/CartController';
import { Product } from '../model/Product';
import { ErrorAmigable } from '../services/ErrorAmigable';
import { useAuth } from './AuthContext';

export interface CartContextValue extends EstadoControladorCarrito {
  agregarProducto: (product: Product, cantidad?: number) => Promise<void>;
  incrementar: (productId: number) => Promise<void>;
  decrementar: (productId: number) => Promise<void>;
  eliminarProducto: (productId: number) => Promise<void>;
  cantidadDe: (productId: number) => number;
  reintentar: () => void;
  reintentarSincronizacion: () => void;
  limpiarErrorOperacion: () => void;
}

const ESTADO_INACTIVO: EstadoControladorCarrito = {
  estado: 'inactivo',
  carrito: null,
  errorCarga: null,
  errorOperacion: null,
  sincronizando: false,
  productosPendientes: [],
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

// #################### US10: Estado compartido del carrito ####################
export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const userId = usuario?.id;

  const controller = useMemo<CartController | null>(
    () => (userId ? crearCartController(userId) : null),
    [userId],
  );

  const suscribir = useCallback(
    (alCambiar: () => void) => (controller ? controller.suscribir(alCambiar) : () => {}),
    [controller],
  );

  const obtenerEstado = useCallback(
    () => controller?.getState() ?? ESTADO_INACTIVO,
    [controller],
  );

  // useSyncExternalStore mantiene React sincronizado con el controlador externo
  // sin llamar setState dentro de un efecto.
  const estado = useSyncExternalStore(suscribir, obtenerEstado, obtenerEstado);

  useEffect(() => {
    if (!controller) {
      return;
    }

    void controller.cargar();
    return () => controller.dispose();
  }, [controller]);

  const value = useMemo<CartContextValue>(() => {
    const requerirControlador = (): CartController => {
      if (!controller) {
        throw new ErrorAmigable('Inicia sesión para administrar tu carrito.');
      }
      return controller;
    };

    return {
      ...estado,
      agregarProducto: async (product: Product, cantidad = 1) => {
        await requerirControlador().agregar(product, cantidad);
      },
      incrementar: async (productId: number) => {
        await requerirControlador().incrementar(productId);
      },
      decrementar: async (productId: number) => {
        await requerirControlador().decrementar(productId);
      },
      eliminarProducto: async (productId: number) => {
        await requerirControlador().eliminar(productId);
      },
      cantidadDe: (productId: number) => estado.carrito?.cantidadDe(productId) ?? 0,
      reintentar: () => {
        if (controller) {
          void controller.cargar(true);
        }
      },
      reintentarSincronizacion: () => {
        controller?.reintentarSincronizacion();
      },
      limpiarErrorOperacion: () => {
        controller?.limpiarErrorOperacion();
      },
    };
  }, [controller, estado]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider.');
  }
  return context;
}
// #################################### Fin de US10 ####################################

/**
 * Controlador de la pantalla de catálogo.
 *
 * Gestiona el estado de la obtención de productos (loading / success / error),
 * la petición inicial y el reintento, y entrega los datos a la vista.
 */

import { useCallback, useEffect, useReducer } from 'react';

import { Product } from '../model/Product';
import { fetchProducts } from '../services/ProductDetailService';

export type ProductCatalogStatus = 'loading' | 'success' | 'error';

export interface ProductCatalogState {
  status: ProductCatalogStatus;
  products: Product[];
}

type ProductCatalogAction =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; products: Product[] }
  | { type: 'ERROR' };

export interface ProductControllerResult {
  status: ProductCatalogStatus;
  products: Product[];
  isLoading: boolean;
  hasError: boolean;
  /** Dispara la petición (o cancela la petición en curso si existe). */
  retry: () => void;
}

const initialState: ProductCatalogState = {
  status: 'loading',
  products: [],
};

function reducer(
  state: ProductCatalogState,
  action: ProductCatalogAction,
): ProductCatalogState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading' };
    case 'SUCCESS':
      return { status: 'success', products: action.products };
    case 'ERROR':
      return { status: 'error', products: [] };
    default:
      return state;
  }
}

/**
 * Hook que actúa como controlador del catálogo de productos.
 * Expone el estado (loading/error/éxito), los productos y la acción reintentar.
 */
export function useProductController(): ProductControllerResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  /**
   * Inicia la petición. Devuelve una función de limpieza que aborta la
   * petición en curso, evitando actualizaciones de estado tras el desmontaje.
   */
  const loadProducts = useCallback(() => {
    const controller = new AbortController();
    const { signal } = controller;

    dispatch({ type: 'LOADING' });

    fetchProducts(signal)
      .then((products) => {
        if (!signal.aborted) {
          dispatch({ type: 'SUCCESS', products });
        }
      })
      .catch(() => {
        if (!signal.aborted) {
          dispatch({ type: 'ERROR' });
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => loadProducts(), [loadProducts]);

  return {
    status: state.status,
    products: state.products,
    isLoading: state.status === 'loading',
    hasError: state.status === 'error',
    retry: loadProducts,
  };
}

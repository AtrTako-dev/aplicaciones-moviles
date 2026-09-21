/**
 * Controlador de la pantalla de detalle del producto (US05).
 *
 * Gestiona el estado de la obtención de un producto (loading / success /
 * error), la petición inicial y el reintento, y las operaciones de
 * edición y eliminación para el rol Administrador.
 */

import { useCallback, useEffect, useReducer } from 'react';

import { Product } from '../model/Product';
import { deleteProduct, getProductById, ProductUpdateData, updateProduct } from '../services/ProductDetailService';

export type ProductDetailStatus = 'loading' | 'success' | 'error';

export interface ProductDetailState {
  status: ProductDetailStatus;
  product: Product | null;
}

type ProductDetailAction =
  | { type: 'LOADING' }
  | { type: 'SUCCESS'; product: Product }
  | { type: 'ERROR' };

export interface ProductDetailControllerResult {
  status: ProductDetailStatus;
  product: Product | null;
  productId: number;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
  guardarProducto: (data: ProductUpdateData) => Promise<Product | null>;
  eliminarProducto: () => Promise<void>;
}

const initialState: ProductDetailState = {
  status: 'loading',
  product: null,
};

function reducer(
  state: ProductDetailState,
  action: ProductDetailAction,
): ProductDetailState {
  switch (action.type) {
    case 'LOADING':
      return { ...state, status: 'loading' };
    case 'SUCCESS':
      return { status: 'success', product: action.product };
    case 'ERROR':
      return { status: 'error', product: null };
    default:
      return state;
  }
}

/**
 * Hook que actúa como controlador del detalle de un producto.
 */
export function useProductDetailController(productId: number): ProductDetailControllerResult {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadProduct = useCallback(() => {
    const controller = new AbortController();
    const { signal } = controller;

    dispatch({ type: 'LOADING' });

    getProductById(productId, signal)
      .then((product) => {
        if (!signal.aborted) {
          dispatch({ type: 'SUCCESS', product });
        }
      })
      .catch((error) => {
        const esAbort = error instanceof Error && error.name === 'AbortError';
        if (!signal.aborted && !esAbort) {
          dispatch({ type: 'ERROR' });
        }
      });

    return () => controller.abort();
  }, [productId]);

  useEffect(() => loadProduct(), [loadProduct]);

  const guardarProducto = useCallback(
    async (data: ProductUpdateData): Promise<Product | null> => {
      return updateProduct(productId, data);
    },
    [productId],
  );

  const eliminarProducto = useCallback(async (): Promise<void> => {
    await deleteProduct(productId);
  }, [productId]);

  return {
    status: state.status,
    product: state.product,
    productId,
    isLoading: state.status === 'loading',
    hasError: state.status === 'error',
    retry: loadProduct,
    guardarProducto,
    eliminarProducto,
  };
}

/**
 * Controlador de la pantalla de catálogo.
 *
 * Gestiona el estado de la obtención de productos (loading / success / error),
 * la petición inicial y el reintento, y entrega los datos a la vista.
 */

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { Product } from '../model/Product';
import {
  getProductCategories,
  getProducts,
  getProductsByCategory,
} from '../services/ProductDetailService';

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
  categories: string[];
  categoriesLoading: boolean;
  categoriesError: boolean;
  selectedCategory: string | null;
  selectCategory: (category: string | null) => void;
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
      return { status: 'loading', products: [] };
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
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const requestId = useRef(0);

  /**
   * Inicia la petición. Devuelve una función de limpieza que aborta la
   * petición en curso, evitando actualizaciones de estado tras el desmontaje.
   */
  const loadProducts = useCallback((category: string | null) => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    const controller = new AbortController();
    const { signal } = controller;

    dispatch({ type: 'LOADING' });

    const request = category ? getProductsByCategory(category, signal) : getProducts(signal);
    request
      .then((products) => {
        if (!signal.aborted && requestId.current === currentRequest) {
          dispatch({ type: 'SUCCESS', products });
        }
      })
      .catch(() => {
        if (!signal.aborted && requestId.current === currentRequest) {
          dispatch({ type: 'ERROR' });
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => loadProducts(null), [loadProducts]);

  useEffect(() => {
    const controller = new AbortController();
    getProductCategories(controller.signal)
      .then((items) => setCategories(items))
      .catch(() => {
        if (!controller.signal.aborted) setCategoriesError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCategoriesLoading(false);
      });
    return () => controller.abort();
  }, []);

  const selectCategory = useCallback(
    (category: string | null) => {
      setSelectedCategory(category);
      loadProducts(category);
    },
    [loadProducts],
  );

  const retry = useCallback(() => loadProducts(selectedCategory), [loadProducts, selectedCategory]);

  return {
    status: state.status,
    products: state.products,
    isLoading: state.status === 'loading',
    hasError: state.status === 'error',
    categories,
    categoriesLoading,
    categoriesError,
    selectedCategory,
    selectCategory,
    retry,
  };
}

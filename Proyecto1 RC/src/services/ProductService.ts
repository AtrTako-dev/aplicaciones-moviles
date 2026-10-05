import { Producto } from '../model/Producto';
import { ApiClient } from './ApiClient';
import { ErrorAmigable } from './ErrorAmigable';

export class ProductService {
  constructor(private readonly api: ApiClient) {}

  // #################### US03: Consultar catálogo ###########################
  async obtenerProductos(): Promise<Producto[]> {
    try {
      return await this.api.request<Producto[]>('/products');
    } catch (error) {
      if (error instanceof ErrorAmigable) {
        throw error;
      }
      throw new ErrorAmigable('No se pudo cargar el catálogo. Inténtalo nuevamente.');
    }
  }
  // ############################ Fin de US03 ################################

  // #################### US04: Consultar categorías #########################
  async obtenerCategorias(): Promise<string[]> {
    try {
      return await this.api.request<string[]>('/products/categories');
    } catch (error) {
      if (error instanceof ErrorAmigable) {
        throw error;
      }
      throw new ErrorAmigable('No se pudieron cargar las categorías. Inténtalo nuevamente.');
    }
  }
  // ############################ Fin de US04 ################################

  // #################### US04: Filtrar por categoría #######################
  async obtenerProductosPorCategoria(categoria: string): Promise<Producto[]> {
    try {
      const endpoint = `/products/category/${encodeURIComponent(categoria)}`;
      return await this.api.request<Producto[]>(endpoint);
    } catch (error) {
      if (error instanceof ErrorAmigable) {
        throw error;
      }
      throw new ErrorAmigable(
        'No se pudieron cargar los productos de la categoría. Inténtalo nuevamente.',
      );
    }
  }
  // ############################ Fin de US04 ################################
}

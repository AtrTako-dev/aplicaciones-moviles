import { Producto } from '../model/Producto';
import { NetworkService } from '../services/NetworkService';
import { ProductService } from '../services/ProductService';

export class CatalogController {
  constructor(
    private readonly productService: ProductService,
    private readonly networkService: NetworkService,
  ) {}

  // #################### US04: Cargar categorías ############################
  async obtenerCategorias(): Promise<string[]> {
    await this.networkService.verificarConexion();
    return this.productService.obtenerCategorias();
  }
  // ############################ Fin de US04 ################################

  // #################### US03 y US04: Cargar catálogo ######################
  async obtenerProductos(categoria: string | null): Promise<Producto[]> {
    await this.networkService.verificarConexion();
    return categoria
      ? this.productService.obtenerProductosPorCategoria(categoria)
      : this.productService.obtenerProductos();
  }
  // ############################ Fin de US03 y US04 #########################
}

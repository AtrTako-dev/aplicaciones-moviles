import { Producto } from '../model/Producto';
import { NetworkService } from '../services/NetworkService';
import { ProductService } from '../services/ProductService';

export class CatalogController {
  constructor(
    private readonly productService: ProductService,
    private readonly networkService: NetworkService,
  ) {}

  async obtenerCategorias(): Promise<string[]> {
    await this.networkService.verificarConexion();
    return this.productService.obtenerCategorias();
  }

  async obtenerProductos(categoria: string | null): Promise<Producto[]> {
    await this.networkService.verificarConexion();
    return categoria
      ? this.productService.obtenerProductosPorCategoria(categoria)
      : this.productService.obtenerProductos();
  }
}
/**
 * Modelo de dominio del carrito de compras (US10).
 *
 * El carrito trabaja con artículos compuestos por un producto del catálogo y
 * una cantidad entera positiva. Todos los importes se calculan localmente en
 * centavos para evitar errores de precisión.
 */

import { Product } from './Product';
import { aCentavos, formatearMoneda } from '../utils/money';

// #################### US10: Contrato de carrito de Fake Store API ####################
export interface CarritoApiItem {
  productId: number;
  quantity: number;
}

export interface CarritoApi {
  id: number;
  userId: number;
  date: string;
  products: CarritoApiItem[];
}
// #################################### Fin del contrato ####################################

/**
 * Artículo del carrito. La cantidad siempre es un entero mayor o igual a 1:
 * si el dominio recibe cero o un valor negativo, el artículo se descarta.
 */
// #################### US10: Artículo del carrito ####################
export class ItemCarrito {
  constructor(
    readonly product: Product,
    readonly quantity: number,
  ) {}

  get cantidad(): number {
    return ItemCarrito.normalizarCantidad(this.quantity);
  }

  /** Precio unitario en centavos enteros. */
  get precioUnitarioCentavos(): number {
    return aCentavos(this.product.price);
  }

  /** subtotal = precioUnitario × cantidad, calculado en centavos. */
  get subtotalCentavos(): number {
    return this.precioUnitarioCentavos * this.cantidad;
  }

  get precioUnitarioFormateado(): string {
    return formatearMoneda(this.precioUnitarioCentavos);
  }

  get subtotalFormateado(): string {
    return formatearMoneda(this.subtotalCentavos);
  }

  conCantidad(cantidad: number): ItemCarrito {
    return new ItemCarrito(this.product, ItemCarrito.normalizarCantidad(cantidad));
  }

  static normalizarCantidad(cantidad: number): number {
    if (!Number.isFinite(cantidad)) {
      return 1;
    }
    const entero = Math.trunc(cantidad);
    return entero > 0 ? entero : 1;
  }
}
// #################################### Fin del artículo ####################################

// #################### US10: Carrito y cálculos locales ####################
export class Carrito {
  constructor(
    readonly id: number,
    readonly userId: number,
    readonly items: readonly ItemCarrito[],
    readonly date: string = new Date().toISOString(),
  ) {}

  static vacio(id: number, userId: number, date: string = new Date().toISOString()): Carrito {
    return new Carrito(id, userId, [], date);
  }

  get estaVacio(): boolean {
    return this.items.length === 0;
  }

  get cantidadTotal(): number {
    return this.items.reduce((total, item) => total + item.cantidad, 0);
  }

  /** total = suma de los subtotales de todos los artículos. */
  get totalCentavos(): number {
    return this.items.reduce((total, item) => total + item.subtotalCentavos, 0);
  }

  get totalFormateado(): string {
    return formatearMoneda(this.totalCentavos);
  }

  buscarItem(productId: number): ItemCarrito | undefined {
    return this.items.find((item) => item.product.id === productId);
  }

  cantidadDe(productId: number): number {
    return this.buscarItem(productId)?.cantidad ?? 0;
  }

  /** Agrega una o más unidades. Si el producto ya existe, acumula la cantidad. */
  agregar(product: Product, cantidad = 1): Carrito {
    const cantidadNormalizada = ItemCarrito.normalizarCantidad(cantidad);
    const existente = this.buscarItem(product.id);

    if (existente) {
      return this.cambiarCantidad(product.id, existente.cantidad + cantidadNormalizada);
    }

    return new Carrito(
      this.id,
      this.userId,
      [...this.items, new ItemCarrito(product, cantidadNormalizada)],
      this.date,
    );
  }

  /**
   * Fija la cantidad de un producto. Las cantidades no enteras se truncan y
   * cero o valores negativos eliminan el artículo (nunca se guardan negativos).
   */
  cambiarCantidad(productId: number, cantidad: number): Carrito {
    if (!Number.isFinite(cantidad) || Math.trunc(cantidad) <= 0) {
      return this.eliminar(productId);
    }

    const entero = Math.trunc(cantidad);
    return new Carrito(
      this.id,
      this.userId,
      this.items.map((item) =>
        item.product.id === productId ? item.conCantidad(entero) : item,
      ),
      this.date,
    );
  }

  incrementar(productId: number): Carrito {
    const item = this.buscarItem(productId);
    return item ? this.cambiarCantidad(productId, item.cantidad + 1) : this;
  }

  /** Al llegar a uno, un decremento equivale a eliminar el artículo. */
  decrementar(productId: number): Carrito {
    const item = this.buscarItem(productId);
    if (!item) {
      return this;
    }
    return item.cantidad <= 1
      ? this.eliminar(productId)
      : this.cambiarCantidad(productId, item.cantidad - 1);
  }

  eliminar(productId: number): Carrito {
    return new Carrito(
      this.id,
      this.userId,
      this.items.filter((item) => item.product.id !== productId),
      this.date,
    );
  }

  conIdRemoto(id: number, date: string = this.date): Carrito {
    return new Carrito(id, this.userId, this.items, date);
  }

  aProductosApi(): CarritoApiItem[] {
    return this.items.map((item) => ({
      productId: item.product.id,
      quantity: item.cantidad,
    }));
  }

  aJson(): CarritoPersistido {
    return {
      id: this.id,
      userId: this.userId,
      date: this.date,
      items: this.items.map((item) => ({
        quantity: item.cantidad,
        product: {
          id: item.product.id,
          title: item.product.title,
          price: item.product.price,
          description: item.product.description,
          category: item.product.category,
          image: item.product.image,
          rating: {
            rate: item.product.rating.rate,
            count: item.product.rating.count,
          },
        },
      })),
    };
  }

  /** Reconstruye el carrito desde la respuesta de GET /carts/{id} o GET /carts. */
  static desdeApi(
    remoto: CarritoApi,
    productos: readonly Product[],
  ): Carrito {
    const productosPorId = new Map(productos.map((product) => [product.id, product]));
    const items: ItemCarrito[] = [];

    for (const productoRemoto of remoto.products) {
      const product = productosPorId.get(productoRemoto.productId);
      if (!product) {
        throw new Error(`No se encontró el producto ${productoRemoto.productId} del carrito.`);
      }

      const indice = items.findIndex((item) => item.product.id === product.id);
      if (indice >= 0) {
        const existente = items[indice];
        items[indice] = existente.conCantidad(existente.cantidad + productoRemoto.quantity);
      } else {
        items.push(new ItemCarrito(product, ItemCarrito.normalizarCantidad(productoRemoto.quantity)));
      }
    }

    return new Carrito(remoto.id, remoto.userId, items, remoto.date);
  }

  /** Recupera el carrito guardado en el dispositivo, validando su estructura. */
  static desdeJson(valor: unknown): Carrito {
    if (!esRegistro(valor) || !Array.isArray(valor.items)) {
      throw new Error('El carrito guardado no tiene un formato válido.');
    }
    if (!esIdValido(valor.id) || !esIdValido(valor.userId)) {
      throw new Error('El carrito guardado no tiene identificadores válidos.');
    }

    const items = valor.items.map((item) => {
      if (!esRegistro(item) || !esRegistro(item.product)) {
        throw new Error('Un artículo del carrito guardado no es válido.');
      }
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error('La cantidad de un artículo guardado no es válida.');
      }
      return new ItemCarrito(Product.fromJson(item.product), quantity);
    });

    const date = typeof valor.date === 'string' ? valor.date : new Date().toISOString();
    return new Carrito(valor.id, valor.userId, items, date);
  }
}

export interface CarritoPersistido {
  id: number;
  userId: number;
  date: string;
  items: {
    quantity: number;
    product: {
      id: number;
      title: string;
      price: number;
      description: string;
      category: string;
      image: string;
      rating: { rate: number; count: number };
    };
  }[];
}

function esRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function esIdValido(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 0;
}
// #################################### Fin del carrito ####################################

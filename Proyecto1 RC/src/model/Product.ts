/**
 * Modelo de datos que representa la estructura de un producto
 * tal como la recibe la Fake Store API.
 */

export interface ProductRating {
  rate: number;
  count: number;
}

export class ProductParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductParseError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class Product {
  readonly id: number;
  readonly title: string;
  readonly price: number;
  readonly description: string;
  readonly category: string;
  readonly image: string;
  readonly rating: ProductRating;

  private constructor(
    id: number,
    title: string,
    price: number,
    description: string,
    category: string,
    image: string,
    rating: ProductRating,
  ) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.description = description;
    this.category = category;
    this.image = image;
    this.rating = rating;
  }

  /** Devuelve el precio formateado como moneda. */
  get formattedPrice(): string {
    return `$${this.price.toFixed(2)}`;
  }

  /**
   * Convierte un objeto desconocido (respuesta de la API) en una instancia
   * de Product, validando que cumpla con la estructura esperada.
   */
  static fromJson(json: unknown): Product {
    if (!isRecord(json)) {
      throw new ProductParseError('El producto no tiene un formato válido.');
    }

    const { id, title, price, description, category, image, rating } = json;

    if (
      typeof id !== 'number' ||
      typeof title !== 'string' ||
      typeof price !== 'number' ||
      typeof description !== 'string' ||
      typeof category !== 'string' ||
      typeof image !== 'string' ||
      !isRecord(rating)
    ) {
      throw new ProductParseError('El producto no cumple con la estructura esperada.');
    }

    const { rate, count } = rating;
    if (typeof rate !== 'number' || typeof count !== 'number') {
      throw new ProductParseError('El rating no cumple con la estructura esperada.');
    }

    return new Product(id, title, price, description, category, image, {
      rate,
      count,
    });
  }
}
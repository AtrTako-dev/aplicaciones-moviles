import { describe, expect, it } from '@jest/globals';

import { Carrito, ItemCarrito } from '../Carrito';
import { Product } from '../Product';

function producto(id: number, price: number, title = `Producto ${id}`): Product {
  return Product.fromJson({
    id,
    title,
    price,
    description: `Descripción ${id}`,
    category: 'test',
    image: `https://fake.img/${id}.png`,
    rating: { rate: 4.5, count: 10 },
  });
}

function carritoCon(items: ItemCarrito[]): Carrito {
  return new Carrito(6, 4, items, '2020-03-01T00:00:00.000Z');
}

describe('Carrito - cálculos locales (US10)', () => {
  it('calcula subtotal = precio unitario × cantidad', () => {
    const item = new ItemCarrito(producto(1, 100), 2);

    expect(item.subtotalCentavos).toBe(20000);
    expect(item.subtotalFormateado).toBe('$200.00');
  });

  it('calcula el total de varios productos con dos decimales', () => {
    const carrito = carritoCon([
      new ItemCarrito(producto(1, 100), 2),
      new ItemCarrito(producto(2, 49.99), 3),
    ]);

    expect(carrito.items[0].subtotalFormateado).toBe('$200.00');
    expect(carrito.items[1].subtotalFormateado).toBe('$149.97');
    expect(carrito.totalCentavos).toBe(34997);
    expect(carrito.totalFormateado).toBe('$349.97');
  });

  it('evita errores de precisión en multiplicaciones decimales', () => {
    const carrito = carritoCon([new ItemCarrito(producto(1, 19.99), 3)]);

    expect(carrito.totalFormateado).toBe('$59.97');
  });

  it('incrementa una cantidad y recalcula subtotal y total', () => {
    const carrito = carritoCon([new ItemCarrito(producto(1, 100), 1)]);
    const incrementado = carrito.incrementar(1);

    expect(incrementado.items[0].cantidad).toBe(2);
    expect(incrementado.items[0].subtotalFormateado).toBe('$200.00');
    expect(incrementado.totalFormateado).toBe('$200.00');
  });

  it('decrementa una cantidad conservando los demás artículos', () => {
    const carrito = carritoCon([
      new ItemCarrito(producto(1, 100), 2),
      new ItemCarrito(producto(2, 49.99), 3),
    ]);
    const decrementado = carrito.decrementar(1);

    expect(decrementado.cantidadDe(1)).toBe(1);
    expect(decrementado.cantidadDe(2)).toBe(3);
    expect(decrementado.items[1]).toBe(carrito.items[1]);
    expect(decrementado.totalFormateado).toBe('$249.97');
  });

  it('elimina el artículo cuando la cantidad llega a cero', () => {
    const carrito = carritoCon([new ItemCarrito(producto(1, 100), 1)]);
    const decrementado = carrito.decrementar(1);

    expect(decrementado.estaVacio).toBe(true);
    expect(decrementado.buscarItem(1)).toBeUndefined();
    expect(decrementado.totalFormateado).toBe('$0.00');
  });

  it('elimina únicamente el producto seleccionado', () => {
    const carrito = carritoCon([
      new ItemCarrito(producto(1, 100), 2),
      new ItemCarrito(producto(2, 49.99), 3),
    ]);
    const eliminado = carrito.eliminar(1);

    expect(eliminado.buscarItem(1)).toBeUndefined();
    expect(eliminado.cantidadDe(2)).toBe(3);
    expect(eliminado.totalFormateado).toBe('$149.97');
  });

  it('no permite cantidades negativas ni cero al cambiar cantidad', () => {
    const carrito = carritoCon([
      new ItemCarrito(producto(1, 100), 2),
      new ItemCarrito(producto(2, 49.99), 3),
    ]);

    const negativo = carrito.cambiarCantidad(1, -5);
    const cero = carrito.cambiarCantidad(2, 0);

    expect(negativo.buscarItem(1)).toBeUndefined();
    expect(cero.buscarItem(2)).toBeUndefined();
    expect(negativo.items.every((item) => item.cantidad > 0)).toBe(true);
    expect(cero.items.every((item) => item.cantidad > 0)).toBe(true);
  });

  it('trunca cantidades decimales a enteros', () => {
    const carrito = carritoCon([new ItemCarrito(producto(1, 10), 1)]);

    expect(carrito.cambiarCantidad(1, 3.9).cantidadDe(1)).toBe(3);
    expect(new ItemCarrito(producto(1, 10), 2.8).cantidad).toBe(2);
    expect(carrito.agregar(producto(2, 5), 1.7).cantidadDe(2)).toBe(1);
  });

  it('acumula unidades cuando se agrega un producto existente', () => {
    const carrito = carritoCon([new ItemCarrito(producto(1, 100), 1)]);
    const agregado = carrito.agregar(producto(1, 100), 2);

    expect(agregado.items).toHaveLength(1);
    expect(agregado.cantidadDe(1)).toBe(3);
  });

  it('mantiene un total de $0.00 cuando está vacío', () => {
    const carrito = Carrito.vacio(0, 4);

    expect(carrito.estaVacio).toBe(true);
    expect(carrito.cantidadTotal).toBe(0);
    expect(carrito.totalCentavos).toBe(0);
    expect(carrito.totalFormateado).toBe('$0.00');
  });

  it('serializa y restaura el carrito conservando productos y cantidades', () => {
    const original = carritoCon([
      new ItemCarrito(producto(1, 100), 2),
      new ItemCarrito(producto(2, 49.99), 3),
    ]);

    const restaurado = Carrito.desdeJson(original.aJson());

    expect(restaurado.id).toBe(6);
    expect(restaurado.userId).toBe(4);
    expect(restaurado.items).toHaveLength(2);
    expect(restaurado.cantidadDe(1)).toBe(2);
    expect(restaurado.totalFormateado).toBe('$349.97');
  });

  it('rechaza una instantánea persistida con estructura inválida', () => {
    expect(() => Carrito.desdeJson({ id: 1 })).toThrow('formato válido');
    expect(() =>
      Carrito.desdeJson({
        id: 1,
        userId: 4,
        date: '2020-01-01',
        items: [{ quantity: -1, product: {} }],
      }),
    ).toThrow();
  });

  it('construye el carrito desde la respuesta de Fake Store API', () => {
    const carrito = Carrito.desdeApi(
      {
        id: 6,
        userId: 4,
        date: '2020-03-01T00:00:00.000Z',
        products: [
          { productId: 10, quantity: 2 },
          { productId: 12, quantity: 3 },
        ],
      },
      [producto(10, 100), producto(12, 49.99)],
    );

    expect(carrito.id).toBe(6);
    expect(carrito.totalFormateado).toBe('$349.97');
    expect(carrito.aProductosApi()).toEqual([
      { productId: 10, quantity: 2 },
      { productId: 12, quantity: 3 },
    ]);
  });

  it('lanza error si falta un producto referenciado por la API', () => {
    expect(() =>
      Carrito.desdeApi(
        {
          id: 6,
          userId: 4,
          date: '2020-03-01T00:00:00.000Z',
          products: [{ productId: 99, quantity: 1 }],
        },
        [],
      ),
    ).toThrow('No se encontró el producto 99');
  });
});

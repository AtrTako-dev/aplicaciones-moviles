import { describe, expect, it, jest } from '@jest/globals';
import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { ItemCarrito } from '../../model/Carrito';
import { Product } from '../../model/Product';
import CartEmptyState from '../CartEmptyState';
import CartItemCard from '../CartItemCard';
import CartSummary from '../CartSummary';

function render(element: React.ReactElement): ReactTestRenderer {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(element);
  });
  return renderer;
}

function desmontar(renderer: ReactTestRenderer): void {
  act(() => {
    renderer.unmount();
  });
}

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

const item = new ItemCarrito(producto(10, 100, 'Producto A'), 2);

describe('CartItemCard - representación de un artículo (US10)', () => {
  it('muestra imagen, nombre, precio unitario, cantidad y subtotal', () => {
    const renderer = render(
      <CartItemCard
        item={item}
        onIncrementar={() => undefined}
        onDecrementar={() => undefined}
        onEliminar={() => undefined}
      />,
    );

    expect(renderer.root.findByProps({ testID: 'cart-item-image-10' }).props.source).toEqual({
      uri: 'https://fake.img/10.png',
    });
    expect(renderer.root.findByProps({ testID: 'cart-item-title-10' }).props.children).toBe(
      'Producto A',
    );
    expect(
      renderer.root.findByProps({ testID: 'cart-item-unit-price-10' }).props.children.join(''),
    ).toBe('$100.00 c/u');
    expect(renderer.root.findByProps({ testID: 'cart-item-quantity-10' }).props.children).toBe(2);
    expect(renderer.root.findByProps({ testID: 'cart-item-subtotal-10' }).props.children).toBe(
      '$200.00',
    );

    desmontar(renderer);
  });

  it('invoca las acciones de incrementar, decrementar y eliminar', () => {
    const onIncrementar = jest.fn();
    const onDecrementar = jest.fn();
    const onEliminar = jest.fn();
    const renderer = render(
      <CartItemCard
        item={item}
        onIncrementar={onIncrementar}
        onDecrementar={onDecrementar}
        onEliminar={onEliminar}
      />,
    );

    renderer.root.findByProps({ testID: 'cart-increment-10' }).props.onPress();
    renderer.root.findByProps({ testID: 'cart-decrement-10' }).props.onPress();
    renderer.root.findByProps({ testID: 'cart-delete-10' }).props.onPress();

    expect(onIncrementar).toHaveBeenCalledTimes(1);
    expect(onDecrementar).toHaveBeenCalledTimes(1);
    expect(onEliminar).toHaveBeenCalledTimes(1);

    desmontar(renderer);
  });

  it('deshabilita solo los controles del artículo mientras se sincroniza', () => {
    const renderer = render(
      <CartItemCard
        item={item}
        pendiente
        onIncrementar={() => undefined}
        onDecrementar={() => undefined}
        onEliminar={() => undefined}
      />,
    );

    expect(renderer.root.findByProps({ testID: 'cart-increment-10' }).props.disabled).toBe(true);
    expect(renderer.root.findByProps({ testID: 'cart-decrement-10' }).props.disabled).toBe(true);
    expect(renderer.root.findByProps({ testID: 'cart-delete-10' }).props.disabled).toBe(true);
    expect(renderer.root.findByProps({ testID: 'cart-item-syncing-10' })).toBeTruthy();

    desmontar(renderer);
  });
});

describe('CartSummary - total y pago (US10)', () => {
  it('muestra el total con dos decimales y habilita el pago con artículos', () => {
    const onPago = jest.fn();
    const renderer = render(
      <CartSummary totalFormateado="$349.97" vacio={false} onProcederAlPago={onPago} />,
    );

    expect(renderer.root.findByProps({ testID: 'cart-total' }).props.children).toBe('$349.97');
    const checkout = renderer.root.findByProps({ testID: 'cart-checkout-button' });
    expect(checkout.props.disabled).toBe(false);
    checkout.props.onPress();
    expect(onPago).toHaveBeenCalledTimes(1);

    desmontar(renderer);
  });

  it('muestra $0.00 y desactiva el pago cuando el carrito está vacío', () => {
    const renderer = render(
      <CartSummary totalFormateado="$0.00" vacio onProcederAlPago={() => undefined} />,
    );

    expect(renderer.root.findByProps({ testID: 'cart-total' }).props.children).toBe('$0.00');
    expect(renderer.root.findByProps({ testID: 'cart-checkout-button' }).props.disabled).toBe(true);

    desmontar(renderer);
  });
});

describe('CartEmptyState - escenario de carrito vacío (US10)', () => {
  it('muestra el mensaje exacto y permite volver al catálogo', () => {
    const onExplorar = jest.fn();
    const renderer = render(<CartEmptyState onExplorarCatalogo={onExplorar} />);

    expect(renderer.root.findByProps({ testID: 'cart-empty-message' }).props.children).toBe(
      'Tu carrito está vacío, explora el catálogo',
    );

    renderer.root.findByProps({ testID: 'cart-explore-button' }).props.onPress();
    expect(onExplorar).toHaveBeenCalledTimes(1);

    desmontar(renderer);
  });
});

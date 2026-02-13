import { useCartStore } from '../store/cart';

describe('cart store', () => {
  it('adds and updates items', () => {
    useCartStore.getState().clear();
    useCartStore.getState().addItem({ menu_item_id: 1, name: 'A', price: 10 });
    useCartStore.getState().addItem({ menu_item_id: 1, name: 'A', price: 10 });
    expect(useCartStore.getState().items[0].quantity).toBe(2);
    useCartStore.getState().updateQty(1, 1);
    expect(useCartStore.getState().items[0].quantity).toBe(1);
  });
});

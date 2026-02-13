import { create } from 'zustand';

type CartLine = {
  menu_item_id: number;
  name: string;
  quantity: number;
  price: number;
  selected_options?: string;
};

type CartState = {
  items: CartLine[];
  note: string;
  mode: 'delivery' | 'pickup';
  addItem: (item: Omit<CartLine, 'quantity'>) => void;
  updateQty: (menuItemId: number, quantity: number) => void;
  removeItem: (menuItemId: number) => void;
  setNote: (note: string) => void;
  setMode: (mode: 'delivery' | 'pickup') => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  note: '',
  mode: 'delivery',
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((it) => it.menu_item_id === item.menu_item_id);
      if (existing) {
        return {
          items: state.items.map((it) =>
            it.menu_item_id === item.menu_item_id ? { ...it, quantity: it.quantity + 1 } : it,
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),
  updateQty: (menuItemId, quantity) =>
    set((state) => ({
      items: state.items
        .map((it) => (it.menu_item_id === menuItemId ? { ...it, quantity } : it))
        .filter((it) => it.quantity > 0),
    })),
  removeItem: (menuItemId) => set((state) => ({ items: state.items.filter((it) => it.menu_item_id !== menuItemId) })),
  setNote: (note) => set({ note }),
  setMode: (mode) => set({ mode }),
  clear: () => set({ items: [], note: '', mode: 'delivery' }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i._id === product._id);
        if (existing) {
          set({
            items: items.map((i) =>
              i._id === product._id
                ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i._id !== productId) }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i._id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => {
          const price = item.discountedPrice ?? item.price;
          return sum + price * item.quantity;
        }, 0),

      getDiscount: () => {
        const coupon = get().coupon;
        if (!coupon) return 0;
        return coupon.discount || 0;
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return (subtotal - discount) * 0.08;
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        return subtotal > 100 ? 0 : 9.99;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        const tax = get().getTax();
        const shipping = get().getShipping();
        return Math.max(0, subtotal - discount + tax + shipping);
      },

      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'nexastore-cart',
    }
  )
);

export default useCartStore;

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'yas_cart_v1';
const SHIPPING_FEE = 49000;

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function itemKey(item) {
  return `${item.productId}-${item.size}-${item.color || ''}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', isOpen);
    return () => document.body.classList.remove('no-scroll');
  }, [isOpen]);

  const addItem = useCallback((product, size, color, quantity = 1) => {
    const next = {
      productId: product.id,
      slug: product.slug,
      name: product.nameFa,
      nameEn: product.nameEn,
      image: (product.images || [])[0] || '',
      price: product.price,
      size,
      color: color || '',
      quantity,
    };
    setItems((prev) => {
      const key = itemKey(next);
      const existing = prev.find((item) => itemKey(item) === key);
      if (existing) {
        return prev.map((item) =>
          itemKey(item) === key
            ? { ...item, quantity: Math.min(item.quantity + quantity, 10) }
            : item,
        );
      }
      return [...prev, next];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((item) => itemKey(item) !== key));
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    setItems((prev) =>
      prev
        .map((item) =>
          itemKey(item) === key ? { ...item, quantity: Math.max(1, Math.min(quantity, 10)) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const shipping = subtotal > 0 ? SHIPPING_FEE : 0;
    return { subtotal, count, shipping, total: subtotal + shipping };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      totals,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      itemKey,
    }),
    [items, totals, isOpen, addItem, removeItem, updateQuantity, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}

export { SHIPPING_FEE, itemKey };

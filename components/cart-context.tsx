'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  image?: string;
  size?: string;
  color?: string;
  material?: string;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  removeItem: (index: number) => void;
  setQty: (index: number, qty: number) => void;
  clear: () => void;
};

const CART_KEY = 'cart_v1';
const emptyCart: CartContextValue = {
  items: [],
  count: 0,
  subtotal: 0,
  addItem: () => undefined,
  removeItem: () => undefined,
  setQty: () => undefined,
  clear: () => undefined,
};
const CartContext = createContext<CartContextValue>(emptyCart);

function itemKey(item: Partial<CartItem>) {
  return [
    item.id || '',
    item.size || '',
    item.color || '',
    item.material || '',
  ].join('::');
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const data = JSON.parse(
      window.localStorage.getItem(CART_KEY) || '{"items":[]}',
    );
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify({ items }));
  }, [items]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
      subtotal: items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
        0,
      ),
      addItem: (item, qty = 1) => {
        setItems((current) => {
          const safeQty = Math.max(1, Number(qty || 1));
          const next = [...current];
          const key = itemKey(item);
          const existingIndex = next.findIndex(
            (entry) => itemKey(entry) === key,
          );

          if (existingIndex >= 0) {
            next[existingIndex] = {
              ...next[existingIndex],
              qty: next[existingIndex].qty + safeQty,
            };
            return next;
          }

          next.push({
            ...item,
            qty: safeQty,
          });

          return next;
        });
      },
      removeItem: (index) => {
        setItems((current) =>
          current.filter((_, itemIndex) => itemIndex !== index),
        );
      },
      setQty: (index, qty) => {
        setItems((current) =>
          current.map((item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  qty: Math.max(1, Number(qty || 1)),
                }
              : item,
          ),
        );
      },
      clear: () => {
        setItems([]);
      },
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

"use client";

import {
  createContext, useContext, useEffect, useState, useCallback,
} from "react";

export interface CartItem {
  id: string;          // productId
  name: string;
  variant?: string;    // "Small" | "Medium" | "Large" | undefined
  price: number;       // price for the selected variant
  qty: number;
  categorySlug: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">) => void;
  setItemQty: (id: string, variant: string | undefined, qty: number) => void;
  removeItem: (id: string, variant?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = "pv_cart";

function cartKey(id: string, variant?: string) {
  return variant ? `${id}::${variant}` : id;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  /* Hydrate from localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  /* Persist to localStorage on every change */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((incoming: Omit<CartItem, "qty">) => {
    setItems(prev => {
      const key = cartKey(incoming.id, incoming.variant);
      const idx = prev.findIndex(i => cartKey(i.id, i.variant) === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1, price: incoming.price };
        return next;
      }
      return [...prev, { ...incoming, qty: 1 }];
    });
  }, []);

  const setItemQty = useCallback((id: string, variant: string | undefined, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => cartKey(i.id, i.variant) !== cartKey(id, variant)));
    } else {
      setItems(prev => prev.map(i =>
        cartKey(i.id, i.variant) === cartKey(id, variant) ? { ...i, qty } : i
      ));
    }
  }, []);

  const removeItem = useCallback((id: string, variant?: string) => {
    setItems(prev => prev.filter(i => cartKey(i.id, i.variant) !== cartKey(id, variant)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, setItemQty, removeItem, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Product } from "@/functions";

export interface CartItem {
  id: string;
  name: string;
  name_mr: string;
  price: number; // in paise
  qty: number;
  unit: string;
  img: string;
  company: string;
}

interface CartCtx {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);

const CART_KEY = "gg_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const ex = prev.find(i => i.id === newItem.id);
      if (ex) return prev.map(i => i.id === newItem.id ? { ...i, qty: i.qty + newItem.qty } : i);
      return [...prev, newItem];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setItems(prev => prev.map(i => {
      if (i.id === id) {
        const nq = Math.max(1, i.qty + delta);
        return { ...i, qty: nq };
      }
      return i;
    }));
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, addItem, removeItem, updateQty, clearCart, cartTotal, cartCount, isOpen, setIsOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

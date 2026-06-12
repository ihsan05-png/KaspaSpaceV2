import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CART_KEY = 'ks_cart_v1';

export interface CartVariant {
  id: string;
  name: string;
  desc?: string;
  price: number;
  unit?: string | null;
}

export interface CartProduct {
  id: string;
  cat: string;
  title: string;
  loc?: string | null;
  img?: string | null;
  kind: string;
}

export interface CartItem {
  uid: string;
  descriptor: unknown;
  kind: string;
  product: CartProduct;
  variant: CartVariant;
  price: number;
  qty: number;
  adminFee: number;
  depositPct: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, 'uid' | 'qty'> & { qty?: number }) => void;
  remove: (uid: string) => void;
  setQty: (uid: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) return JSON.parse(raw) as CartItem[];
  } catch { /* ignore */ }
  return [];
}

function writeCart(items: CartItem[]) {
  try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch { /* ignore */ }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItemsState] = useState<CartItem[]>(readCart);

  const setItems = useCallback((updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    if (typeof updater === 'function') {
      setItemsState(prev => {
        const next = updater(prev);
        writeCart(next);
        window.dispatchEvent(new CustomEvent('ks:cart', { detail: { items: next } }));
        return next;
      });
    } else {
      setItemsState(updater);
      writeCart(updater);
      window.dispatchEvent(new CustomEvent('ks:cart', { detail: { items: updater } }));
    }
  }, []);

  useEffect(() => {
    const onStorage = () => setItemsState(readCart());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((line: Omit<CartItem, 'uid' | 'qty'> & { qty?: number }) => {
    setItems(prev => {
      const key = JSON.stringify(line.descriptor) + '|' + line.variant.id;
      const found = prev.find(i => JSON.stringify(i.descriptor) + '|' + i.variant.id === key);
      let next: CartItem[];
      if (found) {
        next = prev.map(i => i.uid === found.uid ? { ...i, qty: i.qty + (line.qty ?? 1) } : i);
      } else {
        const uid = 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        next = [...prev, { uid, qty: line.qty ?? 1, ...line }];
      }
      return next;
    });
    window.dispatchEvent(new CustomEvent('ks:cart-add', { detail: line }));
  }, [setItems]);

  const remove = useCallback((uid: string) => {
    setItems(prev => prev.filter(i => i.uid !== uid));
  }, [setItems]);

  const setQty = useCallback((uid: string, qty: number) => {
    if (qty < 1) { remove(uid); return; }
    setItems(prev => prev.map(i => i.uid === uid ? { ...i, qty } : i));
  }, [setItems, remove]);

  const clear = useCallback(() => setItems([]), [setItems]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, add, remove, setQty, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

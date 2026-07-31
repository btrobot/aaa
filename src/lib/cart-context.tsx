'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from './auth-context';
import { api } from './api';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  price: string;
  quantity: number;
  image?: string;
  selected: boolean;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType>({
  items: [],
  totalItems: 0,
  loading: false,
  refreshCart: async () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const data = await api.cart.get();
      setItems(data);
    } catch {
      // Silently fail — cart badge degrades to 0
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart when user changes (login/logout)
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const totalItems = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const contextValue = useMemo(
    () => ({ items, totalItems, loading, refreshCart }),
    [items, totalItems, loading, refreshCart],
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

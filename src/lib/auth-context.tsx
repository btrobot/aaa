'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, setToken, getToken } from './api';

// ─── Types ─────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  phone?: string | null;
  avatar?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

// ─── Provider ──────────────────────────────────────────────────

const STORAGE_KEY = 'nodecoda_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 启动时恢复登录状态
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    // 先从 localStorage 恢复用户信息（避免闪烁）
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch { /* ignore */ }

    // 用 token 向后端验证并获取最新用户信息
    api.auth.me()
      .then((data) => {
        const authUser: AuthUser = { id: data.id, email: data.email, name: data.name, role: data.role || 'customer', phone: data.phone, avatar: data.avatar };
        setUser(authUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      })
      .catch(() => {
        // token 无效，清除
        setToken(null);
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    const authUser: AuthUser = {
      id: res.customer.id,
      email: res.customer.email,
      name: res.customer.name,
      role: res.token.split('.')[1] ? JSON.parse(atob(res.token.split('.')[1])).role : 'customer',
      phone: res.customer.phone,
      avatar: res.customer.avatar,
    };
    setToken(res.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string }) => {
    const res = await api.auth.register(data);
    const authUser: AuthUser = {
      id: res.customer.id,
      email: res.customer.email,
      name: res.customer.name,
      role: 'customer',
      phone: res.customer.phone,
      avatar: res.customer.avatar,
    };
    setToken(res.token);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

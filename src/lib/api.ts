// API 客户端 — 封装所有后端 API 调用
// 所有函数返回类型与 API 路由响应一致

export interface Page {
  id: number;
  authorId: number | null;
  status: boolean;
  sortOrder: number;
  authorName?: string;
  title?: string;
  summary?: string;
  content?: string;
  locale?: string;
  createdAt: string;
  updatedAt: string;
}

const BASE_URL = '';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ============ 产品 ============

export interface ProductDescription {
  id: number;
  productId: number;
  locale: string;
  name: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
}

export interface ProductImage {
  id: number;
  productId: number;
  image: string;
  sortOrder: number;
}

export interface Product {
  id: number;
  sku: string;
  brandId: number | null;
  price: string;
  costPrice: string | null;
  weight: number;
  status: boolean;
  quantity: number;
  sales: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  description: ProductDescription | null;
  descriptions: ProductDescription[];
  images: ProductImage[];
  categoryIds: number[];
  brand: { id: number; name: string } | null;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  brand?: string;
  locale?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const api = {
  // 产品列表
  products: {
    list: (params?: ProductListParams) => {
      const qs = new URLSearchParams();
      if (params?.page) qs.set('page', String(params.page));
      if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
      if (params?.category) qs.set('category', params.category);
      if (params?.search) qs.set('search', params.search);
      if (params?.brand) qs.set('brand', params.brand);
      if (params?.locale) qs.set('locale', params.locale);
      if (params?.sortBy) qs.set('sortBy', params.sortBy);
      if (params?.sortOrder) qs.set('sortOrder', params.sortOrder);
      return request<Product[]>(`/api/products?${qs.toString()}`);
    },
    get: (id: number) => request<Product>(`/api/products/${id}`),
    create: (data: any) =>
      request<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<Product>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/products/${id}`, { method: 'DELETE' }),
  },

  // 分类
  categories: {
    list: (locale?: string) => {
      const qs = locale ? `?locale=${locale}` : '';
      return request<any[]>(`/api/categories${qs}`);
    },
    create: (data: any) =>
      request<any>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
  },

  // 品牌
  brands: {
    list: () => request<any[]>('/api/brands'),
    create: (data: any) =>
      request<any>('/api/brands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: any) =>
      request<any>(`/api/brands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/brands/${id}`, { method: 'DELETE' }),
  },

  // 购物车
  cart: {
    get: (customerId: number, locale?: string) => {
      const qs = locale ? `?customerId=${customerId}&locale=${locale}` : `?customerId=${customerId}`;
      return request<any[]>(`/api/cart${qs}`);
    },
    add: (customerId: number, productId: number, quantity: number) =>
      request<any>('/api/cart', {
        method: 'POST',
        body: JSON.stringify({ customerId, productId, quantity }),
      }),
    update: (id: number, quantity: number) =>
      request<any>(`/api/cart/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    remove: (id: number) =>
      request<void>(`/api/cart/${id}`, { method: 'DELETE' }),
    clear: (customerId: number) =>
      request<void>('/api/cart/clear', {
        method: 'POST',
        body: JSON.stringify({ customerId }),
      }),
  },

  // 订单
  orders: {
    list: (customerId: number) =>
      request<any[]>(`/api/orders?customerId=${customerId}`),
    getAll: () =>
      request<any[]>('/api/orders?admin=true'),
    getById: (id: number) =>
      request<any>(`/api/orders/${id}`),
    get: (number: string) =>
      request<any>(`/api/orders?number=${number}`),
    create: (customerId: number, data?: any) =>
      request<any>('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ customerId, ...data }),
      }),
    updateStatus: (id: number, status: string) =>
      request<any>(`/api/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  // 认证
  auth: {
    register: (data: { email: string; password: string; name: string; locale?: string }) =>
      request<any>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'register', ...data }),
      }),
    login: (data: { email: string; password: string }) =>
      request<any>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', ...data }),
      }),
  },

  // 客户
  customers: {
    get: (id: number) => request<any>(`/api/customers?id=${id}`),
    getAll: () => request<any[]>('/api/customers?admin=true'),
    wishlist: (id: number, locale?: string) => request<any[]>(`/api/customers/wishlist?id=${id}${locale ? `&locale=${locale}` : ''}`),
    removeWishlist: (customerId: number, productId: number) => request<any>(`/api/customers/wishlist?customerId=${customerId}&productId=${productId}`, { method: 'DELETE' }),
    update: (id: number, data: any) =>
      request<any>(`/api/customers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // 文章
  pages: {
    list: (params?: { locale?: string; status?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.locale) qs.set('locale', params.locale);
      if (params?.status !== undefined) qs.set('status', String(params.status));
      return request<Page[]>(`/api/pages?${qs.toString()}`);
    },
    getById: (id: number) =>
      request<Page>(`/api/pages/${id}`),
    create: (data: any) =>
      request<Page>('/api/pages', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: any) =>
      request<Page>(`/api/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/pages/${id}`, { method: 'DELETE' }),
  },
};
// API 客户端 — 封装所有后端 API 调用
// 所有函数返回类型与 API 路由响应一致

// ============ 请求/响应类型 ============

export interface CreateProductInput {
  sku: string;
  brandId?: number;
  price: string;
  costPrice?: string;
  weight?: number;
  status?: boolean;
  quantity?: number;
  sortOrder?: number;
  descriptions: Record<string, Record<string, string | undefined>>;
  categoryIds?: number[];
  images?: string[];
}

export interface UpdateProductInput {
  sku?: string;
  brandId?: number;
  price?: string;
  costPrice?: string;
  weight?: number;
  status?: boolean;
  quantity?: number;
  sortOrder?: number;
  descriptions?: Record<string, Record<string, string | undefined>>;
  categoryIds?: number[];
  images?: string[];
}

export interface CreateCategoryInput {
  name: string;
  locale?: string;
  parentId?: number | null;
  slug?: string;
  status?: boolean;
  description?: string;
}

export interface UpdateCategoryInput {
  name?: string;
  locale?: string;
  parentId?: number | null;
  slug?: string;
  status?: boolean;
  description?: string;
}

export interface CreateBrandInput {
  name: string;
  logo?: string | null;
  description?: string | null;
  website?: string | null;
  sortOrder?: number;
  status?: boolean;
}

export interface UpdateBrandInput {
  name?: string;
  logo?: string | null;
  description?: string | null;
  website?: string | null;
  sortOrder?: number;
  status?: boolean;
}

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

export interface CreateOrderInput {
  locale?: string;
  shippingAddressId?: number;
  shippingAddress?: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state?: string;
    zip?: string;
    country: string;
  };
  paymentAddressId?: number;
  shippingMethod?: string;
  shippingFee?: string;
  paymentMethod?: string;
  currency?: string;
  note?: string;
  customerNote?: string;
}

export interface AuthResponse {
  customer: Customer;
  token: string;
  role: 'customer' | 'admin';
}

export interface Customer {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  groupId: number | null;
  status: boolean;
  newsletter: boolean;
  role?: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  newsletter?: boolean;
}

export interface WishlistItem {
  id: number;
  customerId: number;
  productId: number;
  createdAt: string;
}

export interface ShippingMethod {
  id: number;
  code: string;
  icon: string | null;
  baseFee: string;
  freeShippingThreshold: string | null;
  estimatedDays: string | null;
  status: boolean;
  sortOrder: number;
  name: string;
  description: string | null;
  locale: string;
}

export interface CreatePageInput {
  slug?: string;
  author?: string;
  image?: string;
  status?: boolean;
  sortOrder?: number;
  descriptions: Record<string, Record<string, string | undefined>>;
}

export interface UpdatePageInput {
  slug?: string;
  author?: string;
  image?: string;
  status?: boolean;
  sortOrder?: number;
  descriptions?: Record<string, Record<string, string | undefined>>;
}

export interface AttributeGroup {
  id: number;
  sortOrder: number;
  name: string;
  locale: string;
  attributes: AttributeItem[];
}

export interface AttributeItem {
  id: number;
  attributeGroupId: number | null;
  sortOrder: number;
  name: string;
  locale: string;
  values: AttributeValue[];
}

export interface AttributeValue {
  id: number;
  attributeId: number;
  sortOrder: number;
  name: string;
  locale: string;
}

export interface CreateAttributeInput {
  sortOrder?: number;
  descriptions: Record<string, { name: string }>;
  attributeGroupId?: number;
  attributeId?: number;
}

export interface UpdateAttributeInput {
  sortOrder?: number;
  descriptions: Record<string, { name: string }>;
}

// ============ 现有接口 ============

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

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  sku: string | null;
  price: string;
  quantity: number;
  total: string;
}

export interface Order {
  id: number;
  number: string;
  customerId: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  subtotal: string;
  shippingFee: string;
  discount: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string;
  items: OrderItem[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface Brand {
  id: number;
  name: string;
  slug?: string;
  image?: string | null;
  logo?: string | null;
  description?: string;
  website?: string | null;
  sortOrder?: number;
  status?: boolean;
}

export interface CategoryTreeNode {
  id: number;
  name: string;
  slug?: string;
  parentId?: number | null;
  children?: CategoryTreeNode[];
}

const BASE_URL = '';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('nodecoda_token');
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) {
      localStorage.setItem('nodecoda_token', token);
    } else {
      localStorage.removeItem('nodecoda_token');
    }
  } catch { /* noop */ }
}

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${url}`, {
    headers,
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
      return request<Product[]>(`/api/v1/products?${qs.toString()}`);
    },
    get: (id: number) => request<Product>(`/api/v1/products/${id}`),
    create: (data: CreateProductInput) =>
      request<Product>('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: UpdateProductInput) =>
      request<Product>(`/api/v1/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/v1/products/${id}`, { method: 'DELETE' }),
  },

  // 分类
  categories: {
    list: (locale?: string) => {
      const qs = locale ? `?locale=${locale}` : '';
      return request<CategoryTreeNode[]>(`/api/v1/categories${qs}`);
    },
    create: (data: CreateCategoryInput) =>
      request<CategoryTreeNode>('/api/v1/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: UpdateCategoryInput) =>
      request<CategoryTreeNode>(`/api/v1/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/v1/categories/${id}`, { method: 'DELETE' }),
  },

  // 品牌
  brands: {
    list: () => request<PaginatedResponse<Brand>>('/api/v1/brands'),
    create: (data: CreateBrandInput) =>
      request<Brand>('/api/v1/brands', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: number, data: UpdateBrandInput) =>
      request<Brand>(`/api/v1/brands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/v1/brands/${id}`, { method: 'DELETE' }),
  },

  // 购物车
  cart: {
    get: (locale?: string) => {
      const qs = locale ? `?locale=${locale}` : '';
      return request<CartItem[]>(`/api/v1/cart${qs}`);
    },
    add: (productId: number, quantity: number) =>
      request<CartItem>('/api/v1/cart', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    update: (id: number, quantity: number) =>
      request<CartItem>('/api/v1/cart', {
        method: 'PUT',
        body: JSON.stringify({ id, quantity }),
      }),
    remove: (id: number) =>
      request<{ success: boolean }>(`/api/v1/cart?id=${id}`, { method: 'DELETE' }),
  },

  // 订单
  orders: {
    list: () =>
      request<Order[]>('/api/v1/orders'),
    getAll: () =>
      request<Order[]>('/api/v1/orders?admin=true'),
    getById: (id: number) =>
      request<Order>(`/api/v1/orders/${id}`),
    get: (number: string) =>
      request<Order>(`/api/v1/orders?number=${number}`),
    create: (data?: CreateOrderInput) =>
      request<Order>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }),
    updateStatus: (id: number, status: string) =>
      request<Order>(`/api/v1/orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },

  // 认证
  auth: {
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>('/api/v1/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', ...data }),
      }),
    register: (data: { email: string; password: string; name: string; locale?: string }) =>
      request<AuthResponse>('/api/v1/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'register', ...data }),
      }),
    me: () => request<Customer>('/api/v1/auth/me'),
  },

  // 客户
  customers: {
    get: () => request<Customer>('/api/v1/customers'),
    getAll: () => request<Customer[]>('/api/v1/customers?admin=true'),
    wishlist: () => request<WishlistItem[]>('/api/v1/customers/wishlist'),
    removeWishlist: (productId: number) => request<{ success: boolean }>(`/api/v1/customers/wishlist?productId=${productId}`, { method: 'DELETE' }),
    update: (data: UpdateCustomerInput) =>
      request<Customer>('/api/v1/customers', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  // 配送方式
  shipping: {
    list: (locale?: string) => {
      const qs = locale ? `?locale=${locale}` : '';
      return request<ShippingMethod[]>(`/api/v1/shipping-methods${qs}`);
    },
  },

  // 文章
  pages: {
    list: (params?: { locale?: string; status?: boolean }) => {
      const qs = new URLSearchParams();
      if (params?.locale) qs.set('locale', params.locale);
      if (params?.status !== undefined) qs.set('status', String(params.status));
      return request<PaginatedResponse<Page>>(`/api/v1/pages?${qs.toString()}`);
    },
    getById: (id: number) =>
      request<Page>(`/api/v1/pages/${id}`),
    create: (data: CreatePageInput) =>
      request<Page>('/api/v1/pages', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: UpdatePageInput) =>
      request<Page>(`/api/v1/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      request<void>(`/api/v1/pages/${id}`, { method: 'DELETE' }),
  },

  // 系统设置
  settings: {
    getAll: (locale?: string) => {
      const qs = locale ? `?locale=${locale}` : '';
      return request<Record<string, string>>(`/api/v1/settings${qs}`);
    },
    update: (data: { settings: Record<string, string>; locale?: string }) =>
      request<Record<string, string>>('/api/v1/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },
  attributes: {
    list: (locale: string) =>
      request<AttributeGroup[]>(`/api/v1/attributes?locale=${locale}`),
    create: (type: string, data: CreateAttributeInput) =>
      request<Record<string, unknown>>('/api/v1/attributes', {
        method: 'POST',
        body: JSON.stringify({ type, data }),
      }),
    update: (type: string, id: number, data: UpdateAttributeInput) =>
      request<Record<string, unknown>>('/api/v1/attributes', {
        method: 'PUT',
        body: JSON.stringify({ type, id, data }),
      }),
    delete: (type: string, id: number) =>
      request<{ success: boolean }>(`/api/v1/attributes?type=${type}&id=${id}`, {
        method: 'DELETE',
      }),
  },
};

/**
 * 共享类型定义
 */

/** 分类数据（列表/选择器使用） */
export interface CategoryData {
  id: number;
  name: string;
  children?: CategoryData[];
}

/** 品牌数据（列表/选择器使用） */
export interface BrandData {
  id: number;
  name: string;
  description?: string;
  logo?: string | null;
}

/** 产品数据（首页/产品列表使用） */
export interface ProductData {
  id: number;
  sku: string;
  price: string | number;
  sales: number | null;
  quantity: number | null;
  sortOrder: number;
  status: boolean;
  description: { name: string } | null;
  images: { url: string; sortOrder: number }[];
  brand?: { name: string } | null;
  createdAt: string | Date;
}

/** 购物车项目数据 */
export interface CartItemData {
  id: number;
  productId: number;
  productName: string;
  sku?: string;
  price: string;
  quantity: number;
  selected?: boolean;
  image?: string;
  stock?: number;
}

/** 订单数据 */
export interface OrderItemData {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  price: string;
  quantity: number;
  total: string;
  image?: string;
}
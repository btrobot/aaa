import { db } from '@/lib/db/db';
import { carts, products, productDescriptions, productImages } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface AddCartItemInput {
  customerId: number;
  productId: number;
  skuId?: number;
  quantity: number;
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

export const CartService = {
  async addItem(input: AddCartItemInput) {
    // 检查购物车中是否已有该商品
    const existing = await db.select()
      .from(carts)
      .where(
        and(
          eq(carts.customerId, input.customerId),
          eq(carts.productId, input.productId),
          input.skuId ? eq(carts.skuId, input.skuId) : undefined as any
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // 更新数量
      const [updated] = await db.update(carts)
        .set({ quantity: existing[0].quantity + input.quantity })
        .where(eq(carts.id, existing[0].id))
        .returning();
      return updated;
    }

    // 新增购物车项
    const values: any = {
      customerId: input.customerId,
      productId: input.productId,
      quantity: input.quantity,
      selected: true,
    };
    if (input.skuId !== undefined) {
      values.skuId = input.skuId;
    }
    const [item] = await db.insert(carts).values(values).returning();

    return item;
  },

  async getCart(customerId: number, locale: string = 'zh_cn'): Promise<CartItem[]> {
    // 获取购物车列表，关联产品信息和第一张图片
    const rows = await db.select()
      .from(carts)
      .leftJoin(products, eq(carts.productId, products.id))
      .leftJoin(productDescriptions, and(
        eq(products.id, productDescriptions.productId),
        eq(productDescriptions.locale, locale)
      ))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(eq(carts.customerId, customerId));

    // 按购物车项分组，取第一张图片
    const cartMap = new Map<number, CartItem>();
    for (const row of rows) {
      const cartId = row.carts.id;
      if (!cartMap.has(cartId)) {
        cartMap.set(cartId, {
          id: row.carts.id,
          productId: row.carts.productId,
          productName: row.product_descriptions?.name || '',
          sku: row.products?.sku || '',
          price: row.products?.price || '0',
          quantity: row.carts.quantity,
          image: row.product_images?.image || undefined,
          selected: row.carts.selected ?? true,
        });
      }
    }

    return Array.from(cartMap.values());
  },

  async updateQuantity(id: number, quantity: number, customerId?: number) {
    const [updated] = await db.update(carts)
      .set({ quantity })
      .where(customerId ? and(eq(carts.id, id), eq(carts.customerId, customerId)) : eq(carts.id, id))
      .returning();
    return updated;
  },

  async toggleSelect(id: number, selected: boolean) {
    const [updated] = await db.update(carts)
      .set({ selected })
      .where(eq(carts.id, id))
      .returning();
    return updated;
  },

  async removeItem(customerId: number, cartId: number): Promise<boolean> {
    const result = await db.delete(carts)
      .where(and(eq(carts.id, cartId), eq(carts.customerId, customerId)));
    return (result.rowCount ?? 0) > 0;
  },

  async clearCart(customerId: number) {
    await db.delete(carts).where(eq(carts.customerId, customerId));
    return true;
  },
};
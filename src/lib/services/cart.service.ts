import { db } from '@/lib/db/db';
import { carts, products, productDescriptions, productImages, productSkus } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NotFoundError, BusinessRuleError } from './errors';

/** 购物车数量上限（spec: rules[2]） */
const MAX_QUANTITY = 99;

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
  /**
   * addItem — spec pre:
   *   1. 产品存在且 status=true
   *   2. SKU 存在（如指定）
   *   3. 库存 ≥ 请求数量
   * spec post:
   *   - 如已存在同产品+SKU 则增加数量
   *   - 返回购物车项
   */
  async addItem(input: AddCartItemInput) {
    // pre-1: 产品存在且上架
    const [product] = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
    if (!product) throw new NotFoundError('产品', input.productId);
    if (!product.status) throw new BusinessRuleError('产品已下架，无法加入购物车');

    // pre-2: SKU 存在（如指定）
    if (input.skuId !== undefined) {
      const [sku] = await db.select().from(productSkus).where(eq(productSkus.id, input.skuId)).limit(1);
      if (!sku) throw new NotFoundError('SKU', input.skuId);
    }

    // pre-3: 库存 ≥ 请求数量
    const availableStock = input.skuId !== undefined
      ? (await db.select().from(productSkus).where(eq(productSkus.id, input.skuId)).limit(1))[0]?.quantity ?? 0
      : product.quantity ?? 0;
    if (availableStock < input.quantity) {
      throw new BusinessRuleError(`库存不足：当前库存 ${availableStock}，请求数量 ${input.quantity}`);
    }

    // 查询购物车中是否已有该商品（同产品+SKU）
    const skuCondition = input.skuId !== undefined
      ? eq(carts.skuId, input.skuId)
      : sql`${carts.skuId} IS NULL`;
    const existing = await db.select()
      .from(carts)
      .where(and(
        eq(carts.customerId, input.customerId),
        eq(carts.productId, input.productId),
        skuCondition,
      ))
      .limit(1);

    if (existing.length > 0) {
      // 规则: 同产品+SKU 重复添加时增加数量
      const newQuantity = existing[0].quantity + input.quantity;
      if (newQuantity > MAX_QUANTITY) {
        throw new BusinessRuleError(`购物车数量不能超过 ${MAX_QUANTITY}（当前 ${existing[0].quantity}，添加 ${input.quantity}）`);
      }
      const [updated] = await db.update(carts)
        .set({ quantity: newQuantity })
        .where(eq(carts.id, existing[0].id))
        .returning();
      return updated;
    }

    // 新增购物车项
    const [item] = await db.insert(carts).values({
      customerId: input.customerId,
      productId: input.productId,
      skuId: input.skuId ?? null,
      quantity: Math.min(input.quantity, MAX_QUANTITY),
      selected: true,
    }).returning();

    return item;
  },

  /**
   * getCart — spec pre: 客户存在（由 withAuth 保证）
   */
  async getCart(customerId: number, locale: string = 'zh_cn'): Promise<CartItem[]> {
    const rows = await db.select()
      .from(carts)
      .leftJoin(products, eq(carts.productId, products.id))
      .leftJoin(productDescriptions, and(
        eq(products.id, productDescriptions.productId),
        eq(productDescriptions.locale, locale)
      ))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(eq(carts.customerId, customerId));

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

  /**
   * updateQuantity — spec pre:
   *   1. 购物车项存在（且属于该客户）
   *   2. 库存 ≥ 新数量
   *   3. quantity ∈ [1, 99]
   */
  async updateQuantity(id: number, quantity: number, customerId: number) {
    // 参数校验
    if (quantity < 1 || quantity > MAX_QUANTITY) {
      throw new BusinessRuleError(`数量必须在 1-${MAX_QUANTITY} 之间`);
    }

    // pre-1: 购物车项存在且属于该客户
    const [cartItem] = await db.select()
      .from(carts)
      .where(and(eq(carts.id, id), eq(carts.customerId, customerId)))
      .limit(1);
    if (!cartItem) throw new NotFoundError('购物车项', id);

    // pre-2: 库存 ≥ 新数量
    const [product] = await db.select().from(products).where(eq(products.id, cartItem.productId)).limit(1);
    const availableStock = cartItem.skuId
      ? (await db.select().from(productSkus).where(eq(productSkus.id, cartItem.skuId)).limit(1))[0]?.quantity ?? 0
      : product?.quantity ?? 0;
    if (availableStock < quantity) {
      throw new BusinessRuleError(`库存不足：当前库存 ${availableStock}，请求更新为 ${quantity}`);
    }

    const [updated] = await db.update(carts)
      .set({ quantity })
      .where(eq(carts.id, id))
      .returning();
    return updated;
  },

  /**
   * toggleSelect — UI 辅助功能，不在 spec 主操作中
   */
  async toggleSelect(id: number, selected: boolean) {
    const [updated] = await db.update(carts)
      .set({ selected })
      .where(eq(carts.id, id))
      .returning();
    return updated;
  },

  /**
   * removeItem — spec pre: 购物车项存在（且属于该客户）
   */
  async removeItem(customerId: number, cartId: number): Promise<boolean> {
    // 先验证存在
    const [cartItem] = await db.select()
      .from(carts)
      .where(and(eq(carts.id, cartId), eq(carts.customerId, customerId)))
      .limit(1);
    if (!cartItem) throw new NotFoundError('购物车项', cartId);

    await db.delete(carts)
      .where(and(eq(carts.id, cartId), eq(carts.customerId, customerId)));
    return true;
  },

  /**
   * clearCart — spec pre: 客户存在（由 withAuth 保证）
   */
  async clearCart(customerId: number) {
    await db.delete(carts).where(eq(carts.customerId, customerId));
    return true;
  },
};

import { db } from '@/lib/db/db';
import { shippingMethods, shippingMethodDescriptions, orders } from '@/lib/db/schema';
import { eq, and, gte, isNull } from 'drizzle-orm';

export interface ShippingMethodResponse {
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

// 查询条件类型
interface ShippingMethodListParams {
  locale?: string;
  status?: boolean;
}

export const ShippingService = {
  /**
   * 获取可用配送方式列表（含名称描述）
   */
  async list(params: ShippingMethodListParams = {}): Promise<ShippingMethodResponse[]> {
    const locale = params.locale || 'zh_cn';
    const conditions = [eq(shippingMethodDescriptions.locale, locale)];
    if (params.status !== undefined) {
      conditions.push(eq(shippingMethods.status, params.status));
    }

    const rows = await db.select()
      .from(shippingMethods)
      .leftJoin(
        shippingMethodDescriptions,
        and(
          eq(shippingMethods.id, shippingMethodDescriptions.shippingMethodId),
          eq(shippingMethodDescriptions.locale, locale)
        )
      )
      .where(and(...conditions))
      .orderBy(shippingMethods.sortOrder);

    return rows.map(row => ({
      id: row.shipping_methods.id,
      code: row.shipping_methods.code,
      icon: row.shipping_methods.icon,
      baseFee: row.shipping_methods.baseFee,
      freeShippingThreshold: row.shipping_methods.freeShippingThreshold,
      estimatedDays: row.shipping_methods.estimatedDays,
      status: row.shipping_methods.status ?? true,
      sortOrder: row.shipping_methods.sortOrder ?? 0,
      name: row.shipping_method_descriptions?.name || '',
      description: row.shipping_method_descriptions?.description || null,
      locale,
    }));
  },

  /**
   * 计算配送费用
   */
  calculateFee(method: { baseFee: string; freeShippingThreshold: string | null }, subtotal: number): number {
    const threshold = method.freeShippingThreshold ? parseFloat(method.freeShippingThreshold) : 0;
    if (threshold > 0 && subtotal >= threshold) {
      return 0;
    }
    return parseFloat(method.baseFee);
  },

  /**
   * 更新订单配送方式
   */
  async updateOrderShipping(orderId: number, shippingMethod: string, shippingFee: string) {
    const [updated] = await db.update(orders)
      .set({
        shippingMethod,
        shippingFee,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  },

  /**
   * 创建配送方式
   */
  async create(data: {
    code: string;
    baseFee: string;
    icon?: string;
    freeShippingThreshold?: string;
    estimatedDays?: string;
    sortOrder?: number;
    descriptions: Record<string, { name: string; description?: string }>;
  }) {
    const [method] = await db.insert(shippingMethods).values({
      code: data.code,
      icon: data.icon || null,
      baseFee: data.baseFee,
      freeShippingThreshold: data.freeShippingThreshold || null,
      estimatedDays: data.estimatedDays || null,
      sortOrder: data.sortOrder || 0,
    }).returning();

    for (const [locale, desc] of Object.entries(data.descriptions)) {
      await db.insert(shippingMethodDescriptions).values({
        shippingMethodId: method.id,
        locale,
        name: desc.name,
        description: desc.description || null,
      });
    }

    return method;
  },

  /**
   * 更新配送方式
   */
  async update(id: number, data: {
    code?: string;
    baseFee?: string;
    icon?: string;
    freeShippingThreshold?: string;
    estimatedDays?: string;
    sortOrder?: number;
    status?: boolean;
    descriptions?: Record<string, { name: string; description?: string }>;
  }) {
    const updateData: Record<string, any> = {};
    if (data.code !== undefined) updateData.code = data.code;
    if (data.baseFee !== undefined) updateData.baseFee = data.baseFee;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.freeShippingThreshold !== undefined) updateData.freeShippingThreshold = data.freeShippingThreshold;
    if (data.estimatedDays !== undefined) updateData.estimatedDays = data.estimatedDays;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.status !== undefined) updateData.status = data.status;

    if (Object.keys(updateData).length > 0) {
      await db.update(shippingMethods)
        .set(updateData)
        .where(eq(shippingMethods.id, id));
    }

    if (data.descriptions) {
      for (const [locale, desc] of Object.entries(data.descriptions)) {
        const existing = await db.select()
          .from(shippingMethodDescriptions)
          .where(
            and(
              eq(shippingMethodDescriptions.shippingMethodId, id),
              eq(shippingMethodDescriptions.locale, locale)
            )
          )
          .limit(1);

        if (existing.length > 0) {
          await db.update(shippingMethodDescriptions)
            .set({ name: desc.name, description: desc.description || null })
            .where(
              and(
                eq(shippingMethodDescriptions.shippingMethodId, id),
                eq(shippingMethodDescriptions.locale, locale)
              )
            );
        } else {
          await db.insert(shippingMethodDescriptions).values({
            shippingMethodId: id,
            locale,
            name: desc.name,
            description: desc.description || null,
          });
        }
      }
    }

    return this.list({ locale: 'zh_cn' });
  },

  /**
   * 删除配送方式
   */
  async delete(id: number) {
    await db.delete(shippingMethods).where(eq(shippingMethods.id, id));
  },
};
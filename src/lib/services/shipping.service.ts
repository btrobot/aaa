import { db } from '@/lib/db/db';
import { shippingMethods, shippingMethodDescriptions, orders } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { NotFoundError, BusinessRuleError } from './errors';

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

// 更新数据类型（消除 Record<string, any>）
interface ShippingMethodUpdateData {
  code?: string;
  baseFee?: string;
  icon?: string | null;
  freeShippingThreshold?: string | null;
  estimatedDays?: string | null;
  sortOrder?: number;
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
   * pre: 订单存在
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

    if (!updated) {
      throw new NotFoundError('订单', orderId);
    }

    return updated;
  },

  /**
   * 创建配送方式
   * pre: code 唯一
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
    // pre: code 唯一
    const existingByCode = await db.select()
      .from(shippingMethods)
      .where(eq(shippingMethods.code, data.code))
      .limit(1);

    if (existingByCode.length > 0) {
      throw new BusinessRuleError(`配送方式代码 "${data.code}" 已存在`);
    }

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
   * pre: 配送方式存在
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
    // pre: 配送方式存在
    const existing = await db.select()
      .from(shippingMethods)
      .where(eq(shippingMethods.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundError('配送方式', id);
    }

    const updateData: ShippingMethodUpdateData = {};
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
        const existingDesc = await db.select()
          .from(shippingMethodDescriptions)
          .where(
            and(
              eq(shippingMethodDescriptions.shippingMethodId, id),
              eq(shippingMethodDescriptions.locale, locale)
            )
          )
          .limit(1);

        if (existingDesc.length > 0) {
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
   * pre: 无关联订单
   */
  async delete(id: number) {
    // pre: 配送方式存在
    const existing = await db.select()
      .from(shippingMethods)
      .where(eq(shippingMethods.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new NotFoundError('配送方式', id);
    }

    // pre: 无关联订单
    const relatedOrders = await db.select()
      .from(orders)
      .where(eq(orders.shippingMethod, existing[0].code))
      .limit(1);

    if (relatedOrders.length > 0) {
      throw new BusinessRuleError('有关联订单的配送方式不可删除');
    }

    await db.delete(shippingMethodDescriptions)
      .where(eq(shippingMethodDescriptions.shippingMethodId, id));

    await db.delete(shippingMethods).where(eq(shippingMethods.id, id));
  },
};

import { eq, and, desc, count, SQL } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { reviews, customers, products, orders, orderProducts } from '@/lib/db/schema';
import { NotFoundError, BusinessRuleError } from './errors';

export const CreateReviewSchema = z.object({
  productId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5).default(5),
  content: z.string().optional(),
});

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  content: z.string().optional(),
  status: z.boolean().optional(),
});

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;

export const ReviewService = {
  async create(input: CreateReviewInput) {
    const validated = CreateReviewSchema.parse(input);

    // pre: 产品存在
    const [product] = await db.select({ id: products.id })
      .from(products)
      .where(eq(products.id, validated.productId))
      .limit(1);
    if (!product) {
      throw new NotFoundError('产品', validated.productId);
    }

    // pre: 客户已购买该产品（有已完成订单）
    const purchaseRows = await db.select({ id: orders.id })
      .from(orders)
      .innerJoin(orderProducts, eq(orderProducts.orderId, orders.id))
      .where(and(
        eq(orders.customerId, validated.customerId),
        eq(orderProducts.productId, validated.productId),
        eq(orders.status, 'completed'),
      ))
      .limit(1);
    if (purchaseRows.length === 0) {
      throw new BusinessRuleError('只有已购买该产品的客户才能评价');
    }

    // pre: 该客户未评价过该产品
    const existingRows = await db.select({ id: reviews.id })
      .from(reviews)
      .where(and(
        eq(reviews.productId, validated.productId),
        eq(reviews.customerId, validated.customerId),
      ))
      .limit(1);
    if (existingRows.length > 0) {
      throw new BusinessRuleError('您已经评价过该产品');
    }

    const [review] = await db.insert(reviews).values({
      productId: validated.productId,
      customerId: validated.customerId,
      rating: validated.rating,
      content: validated.content || null,
    }).returning();
    return review;
  },

  async findById(id: number) {
    const rows = await db.select()
      .from(reviews)
      .where(eq(reviews.id, id))
      .leftJoin(customers, eq(reviews.customerId, customers.id));
    if (!rows.length) {
      throw new NotFoundError('评价', id);
    }
    const row = rows[0];
    return { ...row.reviews, customerName: row.customers?.name || '未知用户' };
  },

  async getByProductId(productId: number, status?: boolean) {
    const conditions: SQL[] = [eq(reviews.productId, productId)];
    if (status !== undefined) conditions.push(eq(reviews.status, status));

    const rows = await db.select()
      .from(reviews)
      .where(and(...conditions))
      .leftJoin(customers, eq(reviews.customerId, customers.id))
      .orderBy(desc(reviews.createdAt));

    return rows.map(r => ({
      ...r.reviews,
      customerName: r.customers?.name || '未知用户',
    }));
  },

  async list(params?: { productId?: number; status?: boolean; page?: number; pageSize?: number }) {
    const conditions: SQL[] = [];
    if (params?.productId !== undefined) conditions.push(eq(reviews.productId, params.productId));
    if (params?.status !== undefined) conditions.push(eq(reviews.status, params.status));

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    const rows = await db.select()
      .from(reviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .leftJoin(customers, eq(reviews.customerId, customers.id))
      .orderBy(desc(reviews.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [total] = await db.select({ count: count() })
      .from(reviews)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const items = rows.map(r => ({ ...r.reviews, customerName: r.customers?.name || '未知用户' }));

    if (params?.productId !== undefined) {
      const distRows = await db.select()
        .from(reviews)
        .where(and(eq(reviews.productId, params.productId), eq(reviews.status, true)));

      let sum = 0;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      for (const r of distRows) {
        sum += r.rating;
        const key = r.rating as keyof typeof distribution;
        distribution[key]++;
      }
      const distCount = distRows.length;

      return {
        items,
        total: Number(total.count),
        average: distCount > 0 ? Math.round((sum / distCount) * 10) / 10 : 0,
        distribution,
      };
    }

    return { items, total: Number(total.count) };
  },

  async update(id: number, input: UpdateReviewInput) {
    // pre: 评价存在
    const [existing] = await db.select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);
    if (!existing) {
      throw new NotFoundError('评价', id);
    }

    const validated = UpdateReviewSchema.parse(input);
    const updateData: { rating?: number; content?: string; status?: boolean } = {};
    if (validated.rating !== undefined) updateData.rating = validated.rating;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.status !== undefined) updateData.status = validated.status;

    if (Object.keys(updateData).length > 0) {
      await db.update(reviews).set(updateData).where(eq(reviews.id, id));
    }
    return { id };
  },

  async delete(id: number) {
    // pre: 评价存在
    const [existing] = await db.select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.id, id))
      .limit(1);
    if (!existing) {
      throw new NotFoundError('评价', id);
    }

    await db.delete(reviews).where(eq(reviews.id, id));
    return { success: true };
  },

  async getStats(productId: number) {
    // pre: 产品存在
    const [product] = await db.select({ id: products.id })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);
    if (!product) {
      throw new NotFoundError('产品', productId);
    }

    const rows = await db.select()
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.status, true)));

    const total = rows.length;
    if (total === 0) return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

    let sum = 0;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of rows) {
      sum += r.rating;
      const key = r.rating as keyof typeof distribution;
      distribution[key]++;
    }

    return {
      average: Math.round((sum / total) * 10) / 10,
      total,
      distribution,
    };
  },
};

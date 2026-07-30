import { eq, and, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { reviews, customers } from '@/lib/db/schema';

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
    if (!rows.length) return null;
    const row = rows[0];
    return { ...row.reviews, customerName: row.customers?.name || '未知用户' };
  },

  async getByProductId(productId: number, status?: boolean) {
    const conditions = [eq(reviews.productId, productId)];
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

  async getAll(params?: { status?: boolean; page?: number; pageSize?: number }) {
    const conditions: any[] = [];
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

    return {
      items: rows.map(r => ({ ...r.reviews, customerName: r.customers?.name || '未知用户' })),
      total: Number(total.count),
    };
  },

  async update(id: number, input: UpdateReviewInput) {
    const validated = UpdateReviewSchema.parse(input);
    const updateData: Record<string, any> = {};
    if (validated.rating !== undefined) updateData.rating = validated.rating;
    if (validated.content !== undefined) updateData.content = validated.content;
    if (validated.status !== undefined) updateData.status = validated.status;

    if (Object.keys(updateData).length > 0) {
      await db.update(reviews).set(updateData).where(eq(reviews.id, id));
    }
    return { id };
  },

  async delete(id: number) {
    const result = await db.delete(reviews).where(eq(reviews.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  },

  async getStats(productId: number) {
    const rows = await db.select()
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.status, true)));

    const total = rows.length;
    if (total === 0) return { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

    const sum = rows.reduce((acc, r) => acc + r.rating, 0);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach(r => { distribution[r.rating as keyof typeof distribution]++; });

    return {
      average: Math.round((sum / total) * 10) / 10,
      total,
      distribution,
    };
  },
};
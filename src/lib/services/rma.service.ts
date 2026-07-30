import { eq, and, desc, count, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { rmas, orders, orderProducts, customers } from '@/lib/db/schema';

export const CreateRmaSchema = z.object({
  orderId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  orderProductId: z.number().int().positive(),
  type: z.enum(['refund', 'exchange', 'return']),
  reason: z.string().min(1, '请填写退换货原因'),
  quantity: z.number().int().positive().default(1),
  comment: z.string().optional(),
});

export const UpdateRmaSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'completed', 'cancelled']).optional(),
  adminNote: z.string().optional(),
});

export type CreateRmaInput = z.infer<typeof CreateRmaSchema>;
export type UpdateRmaInput = z.infer<typeof UpdateRmaSchema>;

export const RmaService = {
  async create(input: CreateRmaInput) {
    const validated = CreateRmaSchema.parse(input);
    const [rma] = await db.insert(rmas).values({
      orderId: validated.orderId,
      customerId: validated.customerId,
      orderProductId: validated.orderProductId,
      type: validated.type,
      reason: validated.reason,
      quantity: validated.quantity,
      comment: validated.comment || null,
      status: 'pending',
    }).returning();
    return rma;
  },

  async findById(id: number) {
    const rows = await db.select()
      .from(rmas)
      .where(eq(rmas.id, id))
      .leftJoin(orders, eq(rmas.orderId, orders.id))
      .leftJoin(customers, eq(rmas.customerId, customers.id));
    if (!rows.length) return null;
    const row = rows[0];
    return {
      ...row.rmas,
      orderNumber: row.orders?.id,
      customerName: row.customers?.name || '未知用户',
    };
  },

  async getByCustomerId(customerId: number, status?: string) {
    const conditions = [eq(rmas.customerId, customerId)];
    if (status) conditions.push(eq(rmas.status, status));

    const rows = await db.select()
      .from(rmas)
      .where(and(...conditions))
      .leftJoin(orders, eq(rmas.orderId, orders.id))
      .orderBy(desc(rmas.createdAt));

    return rows.map(r => ({
      ...r.rmas,
      orderNumber: r.orders?.id,
    }));
  },

  async getAll(params?: { status?: string; page?: number; pageSize?: number }) {
    const conditions: any[] = [];
    if (params?.status) conditions.push(eq(rmas.status, params.status));

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    const rows = await db.select()
      .from(rmas)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .leftJoin(orders, eq(rmas.orderId, orders.id))
      .leftJoin(customers, eq(rmas.customerId, customers.id))
      .orderBy(desc(rmas.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [total] = await db.select({ count: count() })
      .from(rmas)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      items: rows.map(r => ({
        ...r.rmas,
        orderNumber: r.orders?.id,
        customerName: r.customers?.name || '未知用户',
      })),
      total: Number(total.count),
    };
  },

  async update(id: number, input: UpdateRmaInput) {
    const validated = UpdateRmaSchema.parse(input);
    const updateData: Record<string, any> = {};
    if (validated.status) updateData.status = validated.status;
    if (validated.adminNote !== undefined) updateData.adminNote = validated.adminNote;

    if (Object.keys(updateData).length > 0) {
      await db.update(rmas).set(updateData).where(eq(rmas.id, id));
    }
    return { id };
  },
};
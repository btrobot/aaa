import { eq, desc, and, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { inquiries, products } from '@/lib/db/schema';
import { NotFoundError } from './errors';

// ─── Zod Schema ────────────────────────────────────────────────

export const CreateInquirySchema = z.object({
  productId: z.number().int().positive(),
  name: z.string().min(1, '姓名不能为空').max(255),
  email: z.string().email('邮箱格式不正确').max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  quantity: z.number().int().min(1).default(1),
  message: z.string().optional(),
});

export const UpdateInquirySchema = z.object({
  status: z.enum(['pending', 'replied', 'closed']).optional(),
});

export type CreateInquiryInput = z.infer<typeof CreateInquirySchema>;
export type UpdateInquiryInput = z.infer<typeof UpdateInquirySchema>;

// ─── Types ─────────────────────────────────────────────────────

export interface Inquiry {
  id: number;
  productId: number;
  customerId: number | null;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  quantity: number;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  productSku?: string;
}

// ─── Service ───────────────────────────────────────────────────

export const InquiryService = {
  async create(input: CreateInquiryInput, customerId?: number) {
    const validated = CreateInquirySchema.parse(input);

    // pre: 产品存在
    const [product] = await db.select({ id: products.id, sku: products.sku })
      .from(products)
      .where(eq(products.id, validated.productId))
      .limit(1);
    if (!product) {
      throw new NotFoundError('产品', validated.productId);
    }

    const [inquiry] = await db.insert(inquiries).values({
      productId: validated.productId,
      customerId: customerId ?? null,
      name: validated.name,
      email: validated.email,
      phone: validated.phone ?? null,
      company: validated.company ?? null,
      quantity: validated.quantity,
      message: validated.message ?? null,
      status: 'pending',
    }).returning();

    return inquiry;
  },

  async list(customerId: number, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;

    const [totalResult] = await db
      .select({ value: count() })
      .from(inquiries)
      .where(eq(inquiries.customerId, customerId));

    const total = Number(totalResult?.value ?? 0);
    const items = await db
      .select({
        id: inquiries.id,
        productId: inquiries.productId,
        customerId: inquiries.customerId,
        name: inquiries.name,
        email: inquiries.email,
        phone: inquiries.phone,
        company: inquiries.company,
        quantity: inquiries.quantity,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        updatedAt: inquiries.updatedAt,
        productSku: products.sku,
      })
      .from(inquiries)
      .leftJoin(products, eq(inquiries.productId, products.id))
      .where(eq(inquiries.customerId, customerId))
      .orderBy(desc(inquiries.createdAt))
      .limit(pageSize)
      .offset(offset);

    return { items, total };
  },

  async getById(id: number, customerId: number) {
    const [inquiry] = await db
      .select({
        id: inquiries.id,
        productId: inquiries.productId,
        customerId: inquiries.customerId,
        name: inquiries.name,
        email: inquiries.email,
        phone: inquiries.phone,
        company: inquiries.company,
        quantity: inquiries.quantity,
        message: inquiries.message,
        status: inquiries.status,
        createdAt: inquiries.createdAt,
        updatedAt: inquiries.updatedAt,
        productSku: products.sku,
      })
      .from(inquiries)
      .leftJoin(products, eq(inquiries.productId, products.id))
      .where(and(
        eq(inquiries.id, id),
        eq(inquiries.customerId, customerId),
      ))
      .limit(1);

    if (!inquiry) {
      throw new NotFoundError('询盘', id);
    }

    return inquiry;
  },

  async updateStatus(id: number, input: UpdateInquiryInput) {
    const validated = UpdateInquirySchema.parse(input);
    const [inquiry] = await db
      .update(inquiries)
      .set({ status: validated.status })
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry;
  },
};
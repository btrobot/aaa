import { db } from '@/lib/db/db';
import { brands, products as productsTable } from '@/lib/db/schema';
import { eq, desc, asc, and, count } from 'drizzle-orm';
import { z } from 'zod';
import { NotFoundError, BusinessRuleError } from './errors';

// Validation schemas
export const createBrandSchema = z.object({
  name: z.string().min(1).max(255),
  logo: z.string().max(500).optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().optional().default(0),
  status: z.boolean().optional().default(true),
});

export const updateBrandSchema = createBrandSchema.partial();

export type CreateBrandInput = z.infer<typeof createBrandSchema>;
export type UpdateBrandInput = z.infer<typeof updateBrandSchema>;

export interface BrandQuery {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  status?: boolean;
}

export const BrandService = {
  /**
   * 创建品牌
   * pre: 品牌名唯一
   */
  async create(data: CreateBrandInput) {
    const validated = createBrandSchema.parse(data);

    // pre: 品牌名唯一
    const [existing] = await db
      .select({ id: brands.id })
      .from(brands)
      .where(eq(brands.name, validated.name))
      .limit(1);
    if (existing) {
      throw new BusinessRuleError(`品牌名 "${validated.name}" 已存在`);
    }

    const [brand] = await db
      .insert(brands)
      .values({
        name: validated.name,
        logo: validated.logo ?? null,
        description: validated.description ?? null,
        website: validated.website ?? null,
        sortOrder: validated.sortOrder ?? 0,
        status: validated.status ?? true,
      })
      .returning();

    return brand;
  },

  /**
   * 按 ID 查找品牌
   * pre: 品牌存在
   */
  async findById(id: number) {
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id))
      .limit(1);

    if (!brand) throw new NotFoundError('品牌', id);
    return brand;
  },

  /**
   * 查找所有品牌（分页 + 筛选）
   */
  async findAll(query: BrandQuery = {}) {
    const { page = 1, limit = 20, sort = 'desc', status } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status !== undefined) {
      conditions.push(eq(brands.status, status));
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(brands)
      .where(and(...conditions));
    const total = Number(totalResult.count);

    const orderByClause = sort === 'asc' ? asc(brands.sortOrder) : desc(brands.sortOrder);

    const items = await db
      .select()
      .from(brands)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return { items, total };
  },

  /**
   * 更新品牌
   * pre: 品牌存在
   */
  async update(id: number, data: UpdateBrandInput) {
    const validated = updateBrandSchema.parse(data);

    // pre: 品牌存在
    await BrandService.findById(id);

    // 构建更新对象，只包含已定义字段
    const updateData: { name?: string; logo?: string | null; description?: string | null; website?: string | null; sortOrder?: number; status?: boolean } = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.logo !== undefined) updateData.logo = validated.logo;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.website !== undefined) updateData.website = validated.website;
    if (validated.sortOrder !== undefined) updateData.sortOrder = validated.sortOrder;
    if (validated.status !== undefined) updateData.status = validated.status;

    const [brand] = await db
      .update(brands)
      .set(updateData)
      .where(eq(brands.id, id))
      .returning();

    return brand;
  },

  /**
   * 删除品牌
   * pre: 品牌存在 + 无关联产品
   */
  async delete(id: number): Promise<boolean> {
    // pre-1: 品牌存在
    await BrandService.findById(id);

    // pre-2: 无关联产品
    const relatedProducts = await db
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(eq(productsTable.brandId, id))
      .limit(1);
    if (relatedProducts.length > 0) {
      throw new BusinessRuleError('该品牌下仍有产品，无法删除。请先移除或转移关联产品，或置 status=false 下架品牌');
    }

    const result = await db
      .delete(brands)
      .where(eq(brands.id, id));

    return (result.rowCount ?? 0) > 0;
  },
};
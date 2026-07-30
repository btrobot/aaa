import { db } from '@/lib/db/db';
import { brands } from '@/lib/db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';
import { z } from 'zod';

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

export class BrandService {
  /**
   * Create a new brand
   */
  static async create(data: CreateBrandInput) {
    const validated = createBrandSchema.parse(data);

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
  }

  /**
   * Find brand by ID
   */
  static async findById(id: number) {
    const [brand] = await db
      .select()
      .from(brands)
      .where(eq(brands.id, id));

    return brand || null;
  }

  /**
   * Find all brands with pagination and filtering
   */
  static async findAll(query: BrandQuery = {}) {
    const { page = 1, limit = 20, sort = 'desc', status } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status !== undefined) {
      conditions.push(eq(brands.status, status));
    }

    const orderByClause = sort === 'asc' ? asc(brands.sortOrder) : desc(brands.sortOrder);

    const result = await db
      .select()
      .from(brands)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return result;
  }

  /**
   * Update a brand
   */
  static async update(id: number, data: UpdateBrandInput) {
    const validated = updateBrandSchema.parse(data);

    const updateData: Record<string, any> = {};
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
  }

  /**
   * Delete a brand
   */
  static async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(brands)
      .where(eq(brands.id, id));

    return (result as any).rowCount > 0;
  }
}
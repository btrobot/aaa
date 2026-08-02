import { db } from '@/lib/db/db';
import { customerGroups, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { NotFoundError, BusinessRuleError } from './errors';

export const createGroupSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  discount: z.string().optional(),
});

export const updateGroupSchema = createGroupSchema.partial();

export const CustomerGroupService = {
  /**
   * 创建客户分组
   */
  async create(data: z.infer<typeof createGroupSchema>) {
    const validated = createGroupSchema.parse(data);
    const [group] = await db.insert(customerGroups).values({
      name: validated.name,
      description: validated.description ?? null,
      discount: validated.discount ?? null,
    }).returning();
    return group;
  },

  /**
   * 获取所有客户分组
   */
  async list() {
    return await db
      .select()
      .from(customerGroups)
      .orderBy(customerGroups.id);
  },

  /**
   * 获取单个分组
   */
  async findById(id: number) {
    const [row] = await db
      .select()
      .from(customerGroups)
      .where(eq(customerGroups.id, id))
      .limit(1);
    if (!row) throw new NotFoundError('客户分组', id);
    return row;
  },

  /**
   * 更新分组
   */
  async update(id: number, data: z.infer<typeof updateGroupSchema>) {
    await CustomerGroupService.findById(id);
    const validated = updateGroupSchema.parse(data);
    const updateData: Record<string, string | null | undefined> = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.discount !== undefined) updateData.discount = validated.discount;

    if (Object.keys(updateData).length > 0) {
      await db.update(customerGroups).set(updateData).where(eq(customerGroups.id, id));
    }
    return CustomerGroupService.findById(id);
  },

  /**
   * 删除分组
   */
  async delete(id: number) {
    await CustomerGroupService.findById(id);

    // 关联客户检查
    const relatedCustomers = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.groupId, id))
      .limit(1);
    if (relatedCustomers.length > 0) {
      throw new BusinessRuleError('该分组下仍有客户，无法删除');
    }

    await db.delete(customerGroups).where(eq(customerGroups.id, id));
    return true;
  },
};
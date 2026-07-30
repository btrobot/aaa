import { db } from '@/lib/db/db';
import { customerGroups, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError, BusinessRuleError } from './errors';

export interface CreateCustomerGroupInput {
  name: string;
  description?: string;
  discount?: string;
}

export interface UpdateCustomerGroupInput {
  name?: string;
  description?: string;
  discount?: string;
}

export class CustomerGroupService {
  async list() {
    const items = await db.select().from(customerGroups).orderBy(customerGroups.id);
    return { items };
  }

  async getById(id: number) {
    const [group] = await db
      .select()
      .from(customerGroups)
      .where(eq(customerGroups.id, id))
      .limit(1);
    if (!group) {
      throw new NotFoundError('客户分组', id);
    }
    return group;
  }

  async create(input: CreateCustomerGroupInput) {
    // pre: 分组名唯一
    const [existing] = await db
      .select({ id: customerGroups.id })
      .from(customerGroups)
      .where(eq(customerGroups.name, input.name))
      .limit(1);
    if (existing) {
      throw new BusinessRuleError('客户分组名已存在');
    }

    // rule: 折扣率 0-100
    if (input.discount !== undefined) {
      const discount = parseFloat(input.discount);
      if (Number.isNaN(discount) || discount < 0 || discount > 100) {
        throw new BusinessRuleError('折扣率必须在 0-100 之间');
      }
    }

    const [group] = await db
      .insert(customerGroups)
      .values({
        name: input.name,
        description: input.description ?? null,
        discount: input.discount ?? '0.00',
      })
      .returning();
    return group;
  }

  async update(id: number, input: UpdateCustomerGroupInput) {
    // pre: 分组存在
    const [existing] = await db
      .select({ id: customerGroups.id })
      .from(customerGroups)
      .where(eq(customerGroups.id, id))
      .limit(1);
    if (!existing) {
      throw new NotFoundError('客户分组', id);
    }

    // rule: 折扣率 0-100
    if (input.discount !== undefined) {
      const discount = parseFloat(input.discount);
      if (Number.isNaN(discount) || discount < 0 || discount > 100) {
        throw new BusinessRuleError('折扣率必须在 0-100 之间');
      }
    }

    const [group] = await db
      .update(customerGroups)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.discount !== undefined && { discount: input.discount }),
      })
      .where(eq(customerGroups.id, id))
      .returning();
    return group;
  }

  async delete(id: number) {
    // pre: 分组存在
    const [existing] = await db
      .select({ id: customerGroups.id })
      .from(customerGroups)
      .where(eq(customerGroups.id, id))
      .limit(1);
    if (!existing) {
      throw new NotFoundError('客户分组', id);
    }

    // pre: 分组无关联客户
    const [customer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.groupId, id))
      .limit(1);
    if (customer) {
      throw new BusinessRuleError('该分组下存在客户，无法删除');
    }

    await db.delete(customerGroups).where(eq(customerGroups.id, id));
    return true;
  }
}

export const customerGroupService = new CustomerGroupService();

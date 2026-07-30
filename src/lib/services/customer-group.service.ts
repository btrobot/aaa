import { db } from '@/lib/db/db';
import { customerGroups, customers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
    return group || null;
  }

  async create(input: CreateCustomerGroupInput) {
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
    // Check if any customers are using this group
    const [customer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.groupId, id))
      .limit(1);
    if (customer) {
      throw new Error('该分组下存在客户，无法删除');
    }
    await db.delete(customerGroups).where(eq(customerGroups.id, id));
  }
}

export const customerGroupService = new CustomerGroupService();
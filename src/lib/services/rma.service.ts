import { eq, and, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db/db';
import { rmas, orders, orderProducts, customers } from '@/lib/db/schema';
import { NotFoundError, BusinessRuleError } from './errors';

// ── Types & Schemas ───────────────────────────────────────────

export type RmaStatus = 'pending' | 'approved' | 'rejected' | 'completed';

interface Transition {
  from: RmaStatus;
  to: RmaStatus[];
}

const STATE_MACHINE: Transition[] = [
  { from: 'pending', to: ['approved', 'rejected'] },
  { from: 'approved', to: ['completed', 'rejected'] },
];

function getNextStatuses(current: RmaStatus): RmaStatus[] {
  const t = STATE_MACHINE.find(t => t.from === current);
  return t ? t.to : [];
}

function isValidTransition(from: RmaStatus, to: RmaStatus): boolean {
  return getNextStatuses(from).includes(to);
}

export const CreateRmaSchema = z.object({
  orderProductId: z.number().int().positive(),
  type: z.enum(['refund', 'exchange', 'return']),
  quantity: z.number().int().positive().default(1),
  reason: z.string().min(1, '请填写退换货原因'),
  comment: z.string().optional(),
});

export const UpdateRmaStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'completed']),
  adminNote: z.string().optional(),
});

export type CreateRmaInput = z.infer<typeof CreateRmaSchema>;
export type UpdateRmaStatusInput = z.infer<typeof UpdateRmaStatusSchema>;

// ── Service ───────────────────────────────────────────────────

export const RmaService = {
  /**
   * 创建退换货申请
   * pre:
   *   - 订单产品存在且订单已完成 (order.status = completed)
   *   - 该订单产品未申请过退换货 (orderProductId 唯一)
   *   - quantity <= 购买数量
   * post: RMA 创建, status = pending
   */
  async create(customerId: number, input: CreateRmaInput) {
    const validated = CreateRmaSchema.parse(input);

    // 校验订单产品存在
    const opRows = await db
      .select()
      .from(orderProducts)
      .leftJoin(orders, eq(orderProducts.orderId, orders.id))
      .where(eq(orderProducts.id, validated.orderProductId));

    if (!opRows.length) {
      throw new NotFoundError('订单产品', validated.orderProductId);
    }

    const orderProduct = opRows[0].order_products;
    const order = opRows[0].orders;

    if (!order) {
      throw new NotFoundError('订单');
    }

    // 订单必须已完成
    if (order.status !== 'completed') {
      throw new BusinessRuleError('订单状态必须为已完成才能申请退换货');
    }

    // 数量不能超过购买数量
    if (validated.quantity > orderProduct.quantity) {
      throw new BusinessRuleError(
        `退换货数量(${validated.quantity})不能超过购买数量(${orderProduct.quantity})`
      );
    }

    // 一个订单产品只能申请一次退换货
    const existingRows = await db
      .select({ id: rmas.id })
      .from(rmas)
      .where(eq(rmas.orderProductId, validated.orderProductId));

    if (existingRows.length > 0) {
      throw new BusinessRuleError('该订单产品已申请过退换货');
    }

    const [rma] = await db
      .insert(rmas)
      .values({
        orderProductId: validated.orderProductId,
        orderId: order.id,
        customerId,
        type: validated.type,
        reason: validated.reason,
        quantity: validated.quantity,
        comment: validated.comment || null,
        status: 'pending',
      })
      .returning();

    return rma;
  },

  /**
   * 按 ID 查找 RMA（含订单和客户信息）
   * pre: RMA 存在
   */
  async findById(id: number) {
    const rows = await db
      .select()
      .from(rmas)
      .where(eq(rmas.id, id))
      .leftJoin(orders, eq(rmas.orderId, orders.id))
      .leftJoin(customers, eq(rmas.customerId, customers.id))
      .leftJoin(orderProducts, eq(rmas.orderProductId, orderProducts.id));

    if (!rows.length) {
      throw new NotFoundError('退换货单', id);
    }

    const row = rows[0];
    return {
      ...row.rmas,
      orderNumber: row.orders?.id,
      customerName: row.customers?.name || '未知用户',
      productName: row.order_products?.name,
    };
  },

  /**
   * 按客户 ID 查询退换货列表
   */
  async getByCustomerId(customerId: number, status?: string) {
    const conditions = [eq(rmas.customerId, customerId)];
    if (status) conditions.push(eq(rmas.status, status));

    const rows = await db
      .select()
      .from(rmas)
      .where(and(...conditions))
      .leftJoin(orders, eq(rmas.orderId, orders.id))
      .orderBy(desc(rmas.createdAt));

    return rows.map(r => ({
      ...r.rmas,
      orderNumber: r.orders?.id,
    }));
  },

  /**
   * 管理员查询全部退换货
   */
  async getAll(params?: { status?: string; page?: number; pageSize?: number }) {
    const conditions = [];
    if (params?.status) conditions.push(eq(rmas.status, params.status));

    const page = params?.page || 1;
    const pageSize = params?.pageSize || 20;

    const rows = await db
      .select()
      .from(rmas)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .leftJoin(orders, eq(rmas.orderId, orders.id))
      .leftJoin(customers, eq(rmas.customerId, customers.id))
      .orderBy(desc(rmas.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const [total] = await db
      .select({ count: count() })
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

  /**
   * 管理员更新退换货状态
   * pre:
   *   - RMA 存在
   *   - 状态转换合法 (state_machine)
   *   - 拒绝时必须填写 adminNote
   */
  async updateStatus(id: number, input: UpdateRmaStatusInput) {
    const validated = UpdateRmaStatusSchema.parse(input);

    // 查找现有 RMA
    const existingRows = await db
      .select()
      .from(rmas)
      .where(eq(rmas.id, id));

    if (!existingRows.length) {
      throw new NotFoundError('退换货单', id);
    }

    const currentRma = existingRows[0];
    const currentStatus = currentRma.status as RmaStatus;

    // 状态转换合法性校验
    if (!isValidTransition(currentStatus, validated.status)) {
      throw new BusinessRuleError(
        `不允许从「${currentStatus}」转换为「${validated.status}」`
      );
    }

    // 拒绝时必须填写 adminNote
    if (validated.status === 'rejected' && !validated.adminNote) {
      throw new BusinessRuleError('拒绝退换货时必须填写管理员备注');
    }

    const [updated] = await db
      .update(rmas)
      .set({
        status: validated.status,
        adminNote: validated.adminNote || currentRma.adminNote,
        updatedAt: new Date(),
      })
      .where(eq(rmas.id, id))
      .returning();

    return updated;
  },

  /**
   * 获取状态机可转换的目标状态列表
   */
  getNextStatuses(current: RmaStatus): RmaStatus[] {
    return getNextStatuses(current);
  },
};

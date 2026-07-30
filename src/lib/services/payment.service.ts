import { db } from '@/lib/db/db';
import { orders, orderPayments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError, BusinessRuleError } from './errors';

// ─── Types ────────────────────────────────────────────────────

export type PaymentMethod = 'stripe' | 'paypal' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

interface PaymentTransition {
  from: PaymentStatus;
  to: PaymentStatus;
}

// ─── State Machine ────────────────────────────────────────────

export class PaymentStateMachine {
  private static readonly transitions: PaymentTransition[] = [
    { from: 'pending', to: 'success' },
    { from: 'pending', to: 'failed' },
    { from: 'success', to: 'refunded' },
    { from: 'failed', to: 'pending' },
  ];

  canTransition(from: PaymentStatus, to: PaymentStatus): boolean {
    return PaymentStateMachine.transitions.some(t => t.from === from && t.to === to);
  }

  getTransitions(): PaymentTransition[] {
    return PaymentStateMachine.transitions;
  }

  getNextStatuses(current: PaymentStatus): PaymentStatus[] {
    return PaymentStateMachine.transitions
      .filter(t => t.from === current)
      .map(t => t.to);
  }
}

// ─── Service ──────────────────────────────────────────────────

export const PaymentService = {
  /**
   * 发起支付 — 模拟 Stripe/PayPal 风格，无真实第三方对接
   *
   * Pre-conditions:
   *   1. 订单存在
   *   2. 订单 status = confirmed
   *   3. 订单 paymentStatus = unpaid
   *   4. 订单属于当前客户
   */
  async createPayment(
    orderId: number,
    method: PaymentMethod,
    customerId: number,
  ): Promise<{ paymentId: number; status: PaymentStatus }> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      throw new NotFoundError('订单', orderId);
    }
    if (order.status !== 'confirmed') {
      throw new BusinessRuleError('订单状态必须为 confirmed 才能发起支付');
    }
    if (order.paymentStatus !== 'unpaid') {
      throw new BusinessRuleError('订单已支付或不可再次支付');
    }
    if (order.customerId !== customerId) {
      throw new BusinessRuleError('订单不属于当前客户');
    }

    // 模拟支付成功（模拟网关默认成功）
    const [payment] = await db.insert(orderPayments)
      .values({
        orderId,
        paymentMethod: method,
        amount: order.total,
        status: 'success',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      })
      .returning();

    // 更新订单支付状态
    await db.update(orders)
      .set({
        paymentStatus: 'paid',
        paymentId: String(payment.id),
        paidAt: new Date(),
        status: 'paid',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return { paymentId: payment.id, status: 'success' as PaymentStatus };
  },

  /**
   * 支付回调 — 模拟支付网关回调
   *
   * Pre-conditions:
   *   1. 支付记录存在
   *   2. 状态转换合法（状态机校验）
   */
  async callback(
    paymentId: number,
    status: 'success' | 'failed',
    transactionId?: string,
  ): Promise<void> {
    const [payment] = await db.select().from(orderPayments).where(eq(orderPayments.id, paymentId)).limit(1);
    if (!payment) {
      throw new NotFoundError('支付记录', paymentId);
    }

    const machine = new PaymentStateMachine();
    const currentStatus = (payment.status ?? 'pending') as PaymentStatus;
    if (!machine.canTransition(currentStatus, status)) {
      throw new BusinessRuleError(
        `无法从 ${currentStatus} 转换到 ${status}`,
      );
    }

    const updateData: { status: string; transactionId?: string } = { status };
    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    await db.update(orderPayments)
      .set(updateData)
      .where(eq(orderPayments.id, paymentId));

    if (status === 'success') {
      await db.update(orders)
        .set({
          paymentStatus: 'paid',
          status: 'paid',
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, payment.orderId));
    }
  },
};

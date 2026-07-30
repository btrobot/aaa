import { db } from '@/lib/db/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export type PaymentStatus = 'unpaid' | 'paid' | 'failed' | 'refunded';

export const PaymentService = {
  /**
   * 模拟支付请求 — 实际项目中应调用 Stripe/PayPal SDK
   * 返回支付重定向URL
   */
  async createPayment(orderId: number): Promise<{ redirectUrl: string; paymentId: string }> {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new Error('订单不存在');
    if (order.paymentStatus === 'paid') throw new Error('订单已支付');

    // 模拟生成支付ID
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 模拟支付页面URL（实际应为 Stripe Checkout Session URL 或 PayPal 链接）
    const redirectUrl = `/payment/${order.number}?paymentId=${paymentId}`;

    return { redirectUrl, paymentId };
  },

  /**
   * 模拟支付确认 — 确认支付成功
   */
  async confirmPayment(orderNumber: string, paymentId: string): Promise<void> {
    const [order] = await db.select().from(orders).where(eq(orders.number, orderNumber)).limit(1);
    if (!order) throw new Error('订单不存在');
    if (order.paymentStatus === 'paid') return; // 已支付

    // 模拟支付处理延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 更新订单状态
    await db.update(orders)
      .set({
        paymentStatus: 'paid',
        paymentId,
        paidAt: new Date(),
        status: 'confirmed', // 支付成功后自动确认订单
        updatedAt: new Date(),
      })
      .where(eq(orders.number, orderNumber));
  },

  /**
   * 处理支付失败
   */
  async failPayment(orderNumber: string): Promise<void> {
    await db.update(orders)
      .set({
        paymentStatus: 'failed',
        updatedAt: new Date(),
      })
      .where(eq(orders.number, orderNumber));
  },

  /**
   * 处理退款
   */
  async refundPayment(orderId: number): Promise<void> {
    await db.update(orders)
      .set({
        paymentStatus: 'refunded',
        status: 'returned',
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));
  },
};
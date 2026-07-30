import { db } from '@/lib/db/db';
import { orders, orderProducts, carts, products, productDescriptions } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled' | 'returned';

interface Transition {
  from: OrderStatus;
  to: OrderStatus;
}

export class OrderStateMachine {
  private static transitions: Transition[] = [
    { from: 'pending', to: 'confirmed' },
    { from: 'pending', to: 'cancelled' },
    { from: 'confirmed', to: 'shipped' },
    { from: 'confirmed', to: 'cancelled' },
    { from: 'shipped', to: 'completed' },
    { from: 'shipped', to: 'returned' },
    { from: 'confirmed', to: 'returned' },
    { from: 'completed', to: 'returned' },
  ];

  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return this.getTransitions().some(
      t => t.from === from && t.to === to
    );
  }

  getTransitions(): Transition[] {
    return OrderStateMachine.transitions;
  }

  getNextStatuses(current: OrderStatus): OrderStatus[] {
    return this.getTransitions()
      .filter(t => t.from === current)
      .map(t => t.to);
  }
}

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
}

export interface CreateOrderInput {
  customerId: number;
  shippingAddressId?: number;
  paymentAddressId?: number;
  shippingMethod?: string;
  paymentMethod?: string;
  currency?: string;
  note?: string;
}

export const OrderService = {
  async create(input: CreateOrderInput) {
    // 获取购物车商品
    const cartItems = await db.select()
      .from(carts)
      .leftJoin(products, eq(carts.productId, products.id))
      .leftJoin(productDescriptions, and(
        eq(products.id, productDescriptions.productId),
        eq(productDescriptions.locale, 'zh_cn')
      ))
      .where(eq(carts.customerId, input.customerId));

    if (cartItems.length === 0) {
      throw new Error('购物车为空');
    }

    // 计算总价
    let total = 0;
    const orderProductsData: any[] = [];

    for (const item of cartItems) {
      const price = parseFloat(item.products?.price || '0');
      const qty = item.carts.quantity;
      total += price * qty;

      orderProductsData.push({
        productId: item.carts.productId,
        skuId: item.carts.skuId,
        name: item.product_descriptions?.name || '',
        quantity: qty,
        price: item.products?.price || '0',
        total: (price * qty).toFixed(2),
      });
    }

    // 创建订单
    const orderNumber = generateOrderNumber();
    const [order] = await db.insert(orders).values({
      number: orderNumber,
      customerId: input.customerId,
      total: total.toFixed(2),
      status: 'pending',
      shippingAddressId: input.shippingAddressId || null,
      paymentAddressId: input.paymentAddressId || null,
      shippingMethod: input.shippingMethod || null,
      paymentMethod: input.paymentMethod || null,
      currency: input.currency || 'CNY',
    }).returning();

    // 创建订单商品
    for (const op of orderProductsData) {
      await db.insert(orderProducts).values({
        orderId: order.id,
        ...op,
      });
    }

    // 清空购物车
    await db.delete(carts).where(eq(carts.customerId, input.customerId));

    return { ...order, orderNumber: order.number };
  },

  async findByNumber(number: string) {
    const [row] = await db.select()
      .from(orders)
      .leftJoin(orderProducts, eq(orders.id, orderProducts.orderId))
      .where(eq(orders.number, number));
    return row || null;
  },

  async getCustomerOrders(customerId: number) {
    const rows = await db.select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(orders.createdAt);
    return rows;
  },

  async updateStatus(orderId: number, newStatus: OrderStatus) {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new Error('订单不存在');

    const machine = new OrderStateMachine();
    if (!machine.canTransition(order.status as OrderStatus, newStatus)) {
      throw new Error(`无法从 ${order.status} 转换到 ${newStatus}`);
    }

    const [updated] = await db.update(orders)
      .set({ status: newStatus })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  },
};
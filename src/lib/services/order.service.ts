import { db } from '@/lib/db/db';
import { orders, orderProducts, carts, products, productDescriptions, customerAddresses } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { NotFoundError, BusinessRuleError } from './errors';

export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'shipped' | 'completed' | 'cancelled' | 'returned';

interface Transition {
  from: OrderStatus;
  to: OrderStatus;
}

export class OrderStateMachine {
  private static transitions: Transition[] = [
    { from: 'pending', to: 'confirmed' },
    { from: 'pending', to: 'cancelled' },
    { from: 'confirmed', to: 'paid' },
    { from: 'confirmed', to: 'cancelled' },
    { from: 'paid', to: 'shipped' },
    { from: 'paid', to: 'cancelled' },
    { from: 'shipped', to: 'completed' },
    { from: 'completed', to: 'returned' },
  ];

  canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return this.getTransitions().some(t => t.from === from && t.to === to);
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
  const rand = randomBytes(4).toString('hex').toUpperCase();
  return `ORD-${y}${m}${d}-${rand}`;
}

export interface CreateOrderInput {
  locale?: string;
  customerId: number;
  shippingAddressId?: number;
  shippingAddress?: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
    state?: string;
    zip?: string;
    country: string;
  };
  paymentAddressId?: number;
  shippingMethod?: string;
  shippingFee?: string;
  paymentMethod?: string;
  currency?: string;
  note?: string;
  customerNote?: string;
}

export const OrderService = {
  getNextStatuses(status: OrderStatus): OrderStatus[] {
    const stateMachine = new OrderStateMachine();
    return stateMachine.getTransitions()
      .filter(t => t.from === status)
      .map(t => t.to);
  },

  /**
   * 创建订单 — 使用事务保护，包含库存扣减
   */
  async create(input: CreateOrderInput) {
    return db.transaction(async (tx) => {
      // 1. 获取购物车商品
      const cartItems = await tx.select()
        .from(carts)
        .leftJoin(products, eq(carts.productId, products.id))
        .leftJoin(productDescriptions, and(
          eq(products.id, productDescriptions.productId),
          eq(productDescriptions.locale, input.locale || 'zh_cn')
        ))
        .where(eq(carts.customerId, input.customerId));

      if (cartItems.length === 0) {
        throw new BusinessRuleError('购物车为空');
      }

      // 2. 检查库存并扣减（原子操作防止超卖）
      let total = 0;
      const orderProductsData: Array<{
        productId: number;
        skuId: number | null;
        sku: string;
        name: string;
        quantity: number;
        price: string;
        total: string;
      }> = [];

      for (const item of cartItems) {
        const price = parseFloat(item.products?.price || '0');
        const qty = item.carts.quantity;
        const productId = item.carts.productId;

        const [updated] = await tx.update(products)
          .set({ quantity: sql`quantity - ${qty}` })
          .where(and(
            eq(products.id, productId),
            sql`quantity >= ${qty}`
          ))
          .returning();

        if (!updated) {
          throw new BusinessRuleError(`商品 (ID: ${productId}) 库存不足`);
        }

        total += price * qty;
        orderProductsData.push({
          productId,
          skuId: item.carts.skuId ?? null,
          sku: item.products?.sku || '',
          name: item.product_descriptions?.name || '',
          quantity: qty,
          price: item.products?.price || '0',
          total: (price * qty).toFixed(2),
        });
      }

      // 3. 处理收货地址
      let shippingAddressId = input.shippingAddressId;
      if (!shippingAddressId && input.shippingAddress) {
        const addr = input.shippingAddress;
        const [customerAddr] = await tx.insert(customerAddresses).values({
          customerId: input.customerId,
          name: addr.name,
          phone: addr.phone,
          address1: addr.address,
          city: addr.city || '',
          zipCode: addr.zip || '',
          countryId: 1,
        }).returning();
        shippingAddressId = customerAddr.id;
      }

      // 4. 计算运费
      const shippingFee = input.shippingFee ? parseFloat(input.shippingFee) : 0;
      const finalTotal = total + shippingFee;

      // 5. 创建订单
      const orderNumber = generateOrderNumber();
      const [order] = await tx.insert(orders).values({
        number: orderNumber,
        customerId: input.customerId,
        total: finalTotal.toFixed(2),
        subtotal: total.toFixed(2),
        shippingFee: shippingFee.toFixed(2),
        status: 'pending',
        shippingAddressId: shippingAddressId || null,
        paymentAddressId: input.paymentAddressId || null,
        shippingMethod: input.shippingMethod || null,
        paymentMethod: input.paymentMethod || null,
        currency: input.currency || 'CNY',
        customerNote: input.customerNote || input.note || null,
      }).returning();

      // 6. 创建订单商品
      for (const op of orderProductsData) {
        await tx.insert(orderProducts).values({
          orderId: order.id,
          ...op,
        });
      }

      // 7. 清空购物车
      await tx.delete(carts).where(eq(carts.customerId, input.customerId));

      return { ...order, orderNumber: order.number };
    });
  },

  async findByNumber(number: string) {
    const [row] = await db.select()
      .from(orders)
      .leftJoin(orderProducts, eq(orders.id, orderProducts.orderId))
      .where(eq(orders.number, number));
    if (!row) {
      throw new NotFoundError('订单', number);
    }
    return row;
  },

  async getAll() {
    const rows = await db.select()
      .from(orders)
      .orderBy(orders.createdAt);
    return rows;
  },

  async getById(id: number) {
    const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) {
      throw new NotFoundError('订单', id);
    }
    const items = await db.select()
      .from(orderProducts)
      .where(eq(orderProducts.orderId, id));
    return { ...order, items };
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
    if (!order) {
      throw new NotFoundError('订单', orderId);
    }

    const machine = new OrderStateMachine();
    if (!machine.canTransition(order.status as OrderStatus, newStatus)) {
      throw new BusinessRuleError(`无法从 ${order.status} 转换到 ${newStatus}`);
    }

    const [updated] = await db.update(orders)
      .set({ status: newStatus })
      .where(eq(orders.id, orderId))
      .returning();
    return updated;
  },

  /**
   * 取消订单 — 仅 pending / confirmed 可取消，恢复库存
   */
  async cancel(orderId: number, customerId: number) {
    return db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (!order) {
        throw new NotFoundError('订单', orderId);
      }
      if (order.customerId !== customerId) {
        throw new BusinessRuleError('无权操作此订单');
      }

      const currentStatus = order.status as OrderStatus;
      if (currentStatus !== 'pending' && currentStatus !== 'confirmed') {
        throw new BusinessRuleError(`订单状态为 ${currentStatus}，不可取消`);
      }

      // 恢复库存
      const items = await tx.select()
        .from(orderProducts)
        .where(eq(orderProducts.orderId, orderId));

      for (const item of items) {
        await tx.update(products)
          .set({ quantity: sql`quantity + ${item.quantity}` })
          .where(eq(products.id, item.productId));
      }

      // 更新订单状态
      const [updated] = await tx.update(orders)
        .set({ status: 'cancelled' })
        .where(eq(orders.id, orderId))
        .returning();

      return updated;
    });
  },
};

import { describe, it, expect, vi, beforeEach } from 'vitest';

function createChainMock(resolvedValue: any) {
  const buildChain = (endValue: any) => {
    return new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve(endValue);
        if (prop === 'catch') return (reject?: Function) => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply(_, __, args) {
        return Promise.resolve(endValue);
      },
    });
  };
  return buildChain(resolvedValue);
}

const mockDb = {
  insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1, number: 'ORD-2024-0001' }])) })) })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
  transaction: vi.fn(async (cb: Function) => cb(mockDb)),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

const { OrderService } = await import('@/lib/services/order.service');

describe('OrderService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('create', () => {
    it('应能从购物车创建订单', async () => {
      // 模拟购物车数据
      const cartItems = [
        { carts: { productId: 1, quantity: 2, skuId: 1 }, products: { id: 1, price: '100.00', sku: 'MER-001' }, product_descriptions: { name: '旋转木马' } },
        { carts: { productId: 2, quantity: 1, skuId: 2 }, products: { id: 2, price: '200.00', sku: 'MER-002' }, product_descriptions: { name: '过山车' } },
      ];
      mockDb.select.mockReturnValue(createChainMock(cartItems));

      const result = await OrderService.create({
        customerId: 1,
        shippingAddressId: 1,
        paymentAddressId: 1,
        shippingMethod: 'flat',
        paymentMethod: 'stripe',
        currency: 'USD',
      });

      expect(result).toBeDefined();
      expect(result.orderNumber).toMatch(/^ORD-/);
    });

    it('购物车为空时不能创建订单', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      await expect(
        OrderService.create({ customerId: 1 })
      ).rejects.toThrow('购物车为空');
    });
  });

  describe('findByNumber', () => {
    it('应能根据订单号查找订单', async () => {
      mockDb.select.mockReturnValue(createChainMock([{
        orders: { id: 1, number: 'ORD-2024-001', total: '300.00', status: 'pending' },
        order_products: [{ id: 1, name: '旋转木马', quantity: 2 }],
      }]));

      const order = await OrderService.findByNumber('ORD-2024-001');
      expect(order).toBeDefined();
    });
  });

  describe('getCustomerOrders', () => {
    it('应返回客户订单列表', async () => {
      mockDb.select.mockReturnValue(createChainMock([
        { id: 1, number: 'ORD-001', total: '100.00', status: 'pending', createdAt: new Date() },
        { id: 2, number: 'ORD-002', total: '200.00', status: 'completed', createdAt: new Date() },
      ]));

      const orders = await OrderService.getCustomerOrders(1);
      expect(orders.length).toBe(2);
    });
  });

  describe('状态机', () => {
    it('pending 状态可流转到 confirmed', async () => {
      const { OrderStateMachine } = await import('@/lib/services/order.service');
      const machine = new OrderStateMachine();
      expect(machine.canTransition('pending', 'confirmed')).toBe(true);
    });

    it('pending 状态可流转到 cancelled', async () => {
      const { OrderStateMachine } = await import('@/lib/services/order.service');
      const machine = new OrderStateMachine();
      expect(machine.canTransition('pending', 'cancelled')).toBe(true);
    });

    it('completed 状态不可流转到 pending', async () => {
      const { OrderStateMachine } = await import('@/lib/services/order.service');
      const machine = new OrderStateMachine();
      expect(machine.canTransition('completed', 'pending')).toBe(false);
    });

    it('shipped 状态可流转到 completed', async () => {
      const { OrderStateMachine } = await import('@/lib/services/order.service');
      const machine = new OrderStateMachine();
      expect(machine.canTransition('shipped', 'completed')).toBe(true);
    });
  });

  describe('getNextStatuses', () => {
    it('pending 状态的下一步应为 confirmed 和 cancelled', async () => {
      const { OrderStateMachine } = await import('@/lib/services/order.service');
      const machine = new OrderStateMachine();
      const next = machine.getNextStatuses('pending');
      expect(next).toContain('confirmed');
      expect(next).toContain('cancelled');
    });
  });

  describe('updateStatus', () => {
    it('应能更新订单状态', async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, status: 'confirmed' }])),
          })),
        })),
      }));

      const result = await OrderService.updateStatus(1, 'confirmed');
      expect(result).toHaveProperty('status', 'confirmed');
    });

    it('非法状态流转应抛出错误', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ id: 1, status: 'pending' }]));
      await expect(OrderService.updateStatus(1, 'shipped')).rejects.toThrow();
    });
  });
});
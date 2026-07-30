import type { OrderStatus } from '@/lib/services/order.service';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, BusinessRuleError } from '@/lib/services/errors';

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown) => {
    return new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: (v: unknown) => unknown) => resolve(endValue);
        if (prop === 'catch') return () => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply() {
        return Promise.resolve(endValue);
      },
    });
  };
  return buildChain(resolvedValue);
}

const mockTx = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockDb = {
  insert: vi.fn(),
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx)),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

const { OrderService, OrderStateMachine } = await import('@/lib/services/order.service');

// ─── 辅助：构造购物车行 ─────────────────────────────────────────

function fakeCartRow(productId: number, qty: number, price: string, skuId?: number) {
  return {
    carts: { productId, quantity: qty, skuId: skuId ?? null },
    products: { id: productId, price, sku: `SKU-${productId}`, quantity: 100 },
    product_descriptions: { name: `商品${productId}` },
  };
}

// ─── 测试 ───────────────────────────────────────────────────────

describe('OrderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // transaction 默认 mock：把 tx 回调参数和 mockTx 统一
    mockDb.transaction.mockImplementation(async (cb: (tx: typeof mockTx) => Promise<unknown>) => cb(mockTx));
  });

  // ═══ create ═══════════════════════════════════════════════════

  describe('create', () => {
    it('购物车有商品时应成功创建订单', async () => {
      const cartRows = [fakeCartRow(1, 2, '100.00'), fakeCartRow(2, 1, '200.00')];

      // tx.select → 购物车查询
      mockTx.select.mockReturnValueOnce(createChainMock(cartRows));
      // tx.update (库存扣减) 两条
      mockTx.update
        .mockReturnValueOnce({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) })
        .mockReturnValueOnce({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 2 }])) })) })) });
      // tx.insert → 订单
      mockTx.insert
        .mockReturnValueOnce({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 10, number: 'ORD-TEST-001', status: 'pending' }])) })) })
        // 订单商品 × 2
        .mockReturnValueOnce({ values: vi.fn(() => Promise.resolve({})) })
        .mockReturnValueOnce({ values: vi.fn(() => Promise.resolve({})) });
      // tx.delete → 清空购物车
      mockTx.delete.mockReturnValueOnce({ where: vi.fn(() => Promise.resolve({})) });

      const result = await OrderService.create({ customerId: 1, shippingAddressId: 1 });
      expect(result).toBeDefined();
      expect(result.orderNumber).toMatch(/^ORD-/);
    });

    it('购物车为空时应抛出 BusinessRuleError', async () => {
      mockTx.select.mockReturnValueOnce(createChainMock([]));

      await expect(OrderService.create({ customerId: 99 })).rejects.toThrow('购物车为空');
    });
  });

  // ═══ getById ══════════════════════════════════════════════════

  describe('getById', () => {
    it('订单存在时应返回订单及商品', async () => {
      const fakeOrder = { id: 1, number: 'ORD-001', status: 'pending', customerId: 1 };
      mockDb.select
        .mockReturnValueOnce(createChainMock([fakeOrder]))   // orders
        .mockReturnValueOnce(createChainMock([{ id: 10, orderId: 1, name: '商品A' }])); // orderProducts

      const result = await OrderService.getById(1);
      expect(result.id).toBe(1);
      expect(result.items).toHaveLength(1);
    });

    it('订单不存在时应抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([]));

      await expect(OrderService.getById(999)).rejects.toThrow('订单不存在');
    });
  });

  // ═══ findByNumber ═════════════════════════════════════════════

  describe('findByNumber', () => {
    it('订单不存在时应抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([]));

      await expect(OrderService.findByNumber('ORD-NONE')).rejects.toThrow(NotFoundError);
    });

    it('订单存在时应返回结果', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([
        { orders: { id: 1, number: 'ORD-001' }, order_products: null },
      ]));

      const row = await OrderService.findByNumber('ORD-001');
      expect(row).toBeDefined();
    });
  });

  // ═══ updateStatus ═════════════════════════════════════════════

  describe('updateStatus', () => {
    it('订单不存在时应抛出 NotFoundError', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([]));

      await expect(OrderService.updateStatus(999, 'confirmed')).rejects.toThrow(NotFoundError);
    });

    it('合法状态转换应成功', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([{ id: 1, status: 'pending' }]));
      mockDb.update.mockReturnValueOnce({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, status: 'confirmed' }])),
          })),
        })),
      });

      const result = await OrderService.updateStatus(1, 'confirmed');
      expect(result.status).toBe('confirmed');
    });

    it('非法状态转换应抛出 BusinessRuleError', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([{ id: 1, status: 'pending' }]));

      await expect(OrderService.updateStatus(1, 'shipped')).rejects.toThrow(/无法从/);
    });
  });

  // ═══ cancel ═══════════════════════════════════════════════════

  describe('cancel', () => {
    it('订单不存在时应抛出 NotFoundError', async () => {
      mockTx.select.mockReturnValueOnce(createChainMock([]));
      await expect(OrderService.cancel(999, 1)).rejects.toThrow(NotFoundError);
    });

    it('非本人订单应抛出 BusinessRuleError', async () => {
      mockTx.select.mockReturnValueOnce(createChainMock([{ id: 1, customerId: 99, status: 'pending' }]));
      await expect(OrderService.cancel(1, 1)).rejects.toThrow('无权操作此订单');
    });

    it('pending 订单可取消并恢复库存', async () => {
      mockTx.select
        .mockReturnValueOnce(createChainMock([{ id: 1, customerId: 1, status: 'pending' }]))  // 订单
        .mockReturnValueOnce(createChainMock([{ productId: 10, quantity: 2 }]));                // orderProducts

      mockTx.update
        .mockReturnValueOnce({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({})) })) })  // 恢复库存
        .mockReturnValueOnce({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1, status: 'cancelled' }])) })) })) }); // 更新状态

      const result = await OrderService.cancel(1, 1);
      expect(result.status).toBe('cancelled');
    });

    it('confirmed 订单可取消', async () => {
      mockTx.select
        .mockReturnValueOnce(createChainMock([{ id: 2, customerId: 1, status: 'confirmed' }]))
        .mockReturnValueOnce(createChainMock([{ productId: 20, quantity: 1 }]));

      mockTx.update
        .mockReturnValueOnce({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({})) })) })
        .mockReturnValueOnce({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 2, status: 'cancelled' }])) })) })) });

      const result = await OrderService.cancel(2, 1);
      expect(result.status).toBe('cancelled');
    });

    it('shipped 订单不可取消', async () => {
      mockTx.select.mockReturnValueOnce(createChainMock([{ id: 3, customerId: 1, status: 'shipped' }]));
      await expect(OrderService.cancel(3, 1)).rejects.toThrow(BusinessRuleError);
    });

    it('completed 订单不可取消', async () => {
      mockTx.select.mockReturnValueOnce(createChainMock([{ id: 4, customerId: 1, status: 'completed' }]));
      await expect(OrderService.cancel(4, 1)).rejects.toThrow(BusinessRuleError);
    });
  });

  // ═══ 状态机 ═══════════════════════════════════════════════════

  describe('状态机', () => {
    const machine = new OrderStateMachine();

    describe('合法转换', () => {
      const legal: Array<[OrderStatus, OrderStatus]> = [
        ['pending', 'confirmed'],
        ['pending', 'cancelled'],
        ['confirmed', 'paid'],
        ['confirmed', 'cancelled'],
        ['paid', 'shipped'],
        ['paid', 'cancelled'],
        ['shipped', 'completed'],
        ['completed', 'returned'],
      ];

      it.each(legal)('%s → %s 应合法', (from, to) => {
        expect(machine.canTransition(from, to)).toBe(true);
      });
    });

    describe('非法转换', () => {
      const illegal: Array<[OrderStatus, OrderStatus]> = [
        ['pending', 'shipped'],
        ['pending', 'completed'],
        ['confirmed', 'shipped'],
        ['cancelled', 'confirmed'],
        ['cancelled', 'paid'],
        ['completed', 'paid'],
        ['returned', 'pending'],
        ['returned', 'confirmed'],
        ['returned', 'cancelled'],
      ];

      it.each(illegal)('%s → %s 应非法', (from, to) => {
        expect(machine.canTransition(from, to)).toBe(false);
      });
    });

    describe('getNextStatuses', () => {
      it('pending 的下一步应为 [confirmed, cancelled]', () => {
        expect(machine.getNextStatuses('pending')).toEqual(expect.arrayContaining(['confirmed', 'cancelled']));
      });

      it('confirmed 的下一步应为 [paid, cancelled]', () => {
        expect(machine.getNextStatuses('confirmed')).toEqual(expect.arrayContaining(['paid', 'cancelled']));
      });

      it('paid 的下一步应为 [shipped, cancelled]', () => {
        expect(machine.getNextStatuses('paid')).toEqual(expect.arrayContaining(['shipped', 'cancelled']));
      });

      it('shipped 的下一步应为 [completed]', () => {
        expect(machine.getNextStatuses('shipped')).toEqual(['completed']);
      });

      it('completed 的下一步应为 [returned]', () => {
        expect(machine.getNextStatuses('completed')).toEqual(['returned']);
      });

      it('cancelled 无后续状态', () => {
        expect(machine.getNextStatuses('cancelled')).toEqual([]);
      });
    });
  });

  // ═══ list (getAll / getCustomerOrders) ═══════════════════════════

  describe('list', () => {
    it('应返回所有订单列表（happy path）', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([
        { id: 1, number: 'ORD-001', status: 'pending', customerId: 1 },
        { id: 2, number: 'ORD-002', status: 'completed', customerId: 2 },
      ]));

      const result = await OrderService.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].number).toBe('ORD-001');
    });

    it('无订单时应返回空数组（happy path）', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([]));

      const result = await OrderService.getAll();
      expect(result).toHaveLength(0);
    });

    it('应能按客户 ID 查询订单（getCustomerOrders）', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([
        { id: 1, number: 'ORD-001', status: 'pending', customerId: 5 },
      ]));

      const result = await OrderService.getCustomerOrders(5);
      expect(result).toHaveLength(1);
      expect(result[0].customerId).toBe(5);
    });

    it('客户无订单时应返回空数组（getCustomerOrders）', async () => {
      mockDb.select.mockReturnValueOnce(createChainMock([]));

      const result = await OrderService.getCustomerOrders(999);
      expect(result).toHaveLength(0);
    });
  });
});

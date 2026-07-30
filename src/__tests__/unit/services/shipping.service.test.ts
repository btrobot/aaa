import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock helpers ──────────────────────────────────────────────

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown): any =>
    new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve(endValue);
        if (prop === 'catch') return () => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply() { return Promise.resolve(endValue); },
    });
  return buildChain(resolvedValue);
}

const mockDb = {
  select: vi.fn(() => createChainMock([])),
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{
        id: 1,
        code: 'express',
        icon: null,
        baseFee: '10.00',
        freeShippingThreshold: null,
        estimatedDays: '3-5',
        sortOrder: 0,
      }])),
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: 1,
          shippingMethod: 'express',
          shippingFee: '10.00',
          updatedAt: new Date(),
        }])),
      })),
    })),
  })),
  delete: vi.fn(() => ({
    where: vi.fn(() => Promise.resolve({ rowCount: 1 })),
  })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelect(data: unknown[]) {
  mockDb.select.mockReturnValue(createChainMock(data));
}

const { ShippingService } = await import('@/lib/services/shipping.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

// ── 测试套件 ─────────────────────────────────────────────────

describe('ShippingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // list
  // ===========================================================================
  describe('list', () => {
    it('应能返回配送方式列表（happy path）', async () => {
      mockSelect([{
        shipping_methods: {
          id: 1, code: 'express', icon: null, baseFee: '10.00',
          freeShippingThreshold: '100.00', estimatedDays: '3-5',
          status: true, sortOrder: 0,
        },
        shipping_method_descriptions: {
          id: 1, shippingMethodId: 1, locale: 'zh_cn',
          name: '快递', description: '标准快递',
        },
      }]);

      const result = await ShippingService.list({ locale: 'zh_cn' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('快递');
      expect(result[0].code).toBe('express');
    });

    it('空列表应返回空数组（happy path）', async () => {
      mockSelect([]);
      const result = await ShippingService.list();
      expect(result).toEqual([]);
    });
  });

  // ===========================================================================
  // calculateFee
  // ===========================================================================
  describe('calculateFee', () => {
    it('未达包邮门槛应返回 baseFee（happy path）', () => {
      const fee = ShippingService.calculateFee(
        { baseFee: '10.00', freeShippingThreshold: '100.00' },
        50,
      );
      expect(fee).toBe(10);
    });

    it('达到包邮门槛应返回 0（happy path）', () => {
      const fee = ShippingService.calculateFee(
        { baseFee: '10.00', freeShippingThreshold: '100.00' },
        100,
      );
      expect(fee).toBe(0);
    });

    it('无包邮门槛应始终返回 baseFee（happy path）', () => {
      const fee = ShippingService.calculateFee(
        { baseFee: '5.00', freeShippingThreshold: null },
        1000,
      );
      expect(fee).toBe(5);
    });
  });

  // ===========================================================================
  // create — pre: code 唯一
  // ===========================================================================
  describe('create', () => {
    it('应能创建配送方式（happy path）', async () => {
      // code 唯一检查 → 空
      mockSelect([]);
      const result = await ShippingService.create({
        code: 'express',
        baseFee: '10.00',
        descriptions: { zh_cn: { name: '快递' } },
      });
      expect(result.code).toBe('express');
    });

    it('code 已存在时应抛出 BusinessRuleError（pre 违反）', async () => {
      mockSelect([{ id: 1, code: 'express' }]);
      await expect(
        ShippingService.create({
          code: 'express',
          baseFee: '10.00',
          descriptions: { zh_cn: { name: '快递' } },
        }),
      ).rejects.toThrow(BusinessRuleError);
    });
  });

  // ===========================================================================
  // update — pre: 配送方式存在
  // ===========================================================================
  describe('update', () => {
    it('应能更新配送方式（happy path）', async () => {
      // 无 descriptions → callCount 1: 存在性检查, callCount 2: list 结果
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, code: 'express' }]);
        }
        // list 结果
        return createChainMock([{
          shipping_methods: {
            id: 1, code: 'express', icon: null, baseFee: '15.00',
            freeShippingThreshold: null, estimatedDays: '1-2',
            status: true, sortOrder: 0,
          },
          shipping_method_descriptions: {
            id: 1, shippingMethodId: 1, locale: 'zh_cn',
            name: '新快递', description: null,
          },
        }]);
      });

      const result = await ShippingService.update(1, { baseFee: '15.00' });
      expect(result).toHaveLength(1);
      expect(result[0].baseFee).toBe('15.00');
    });

    it('应能更新配送方式描述（happy path）', async () => {
      // 带 descriptions → callCount 1: 存在性, 2: 描述查询, 3: list
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, code: 'express' }]);
        }
        if (callCount === 2) {
          return createChainMock([{ id: 1, shippingMethodId: 1, locale: 'zh_cn', name: '旧名' }]);
        }
        // list 结果
        return createChainMock([{
          shipping_methods: {
            id: 1, code: 'express', icon: null, baseFee: '10.00',
            freeShippingThreshold: null, estimatedDays: '1-2',
            status: true, sortOrder: 0,
          },
          shipping_method_descriptions: {
            id: 1, shippingMethodId: 1, locale: 'zh_cn',
            name: '更新后', description: null,
          },
        }]);
      });

      const result = await ShippingService.update(1, {
        descriptions: { zh_cn: { name: '更新后' } },
      });
      expect(result).toHaveLength(1);
    });

    it('配送方式不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);
      await expect(
        ShippingService.update(999, { baseFee: '15.00' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // delete — pre: 存在 + 无关联订单
  // ===========================================================================
  describe('delete', () => {
    it('应能删除配送方式（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, code: 'express' }]);
        }
        return createChainMock([]);
      });

      await expect(ShippingService.delete(1)).resolves.toBeUndefined();
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('配送方式不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);
      await expect(ShippingService.delete(999)).rejects.toThrow(NotFoundError);
    });

    it('有关联订单时应抛出 BusinessRuleError（pre 违反）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, code: 'express' }]);
        }
        return createChainMock([{ id: 10, shippingMethod: 'express' }]);
      });

      await expect(ShippingService.delete(1)).rejects.toThrow(BusinessRuleError);
    });
  });

  // ===========================================================================
  // updateOrderShipping — pre: 订单存在
  // ===========================================================================
  describe('updateOrderShipping', () => {
    it('应能更新订单配送方式（happy path）', async () => {
      const result = await ShippingService.updateOrderShipping(1, 'express', '10.00');
      expect(result.shippingMethod).toBe('express');
    });

    it('订单不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([])),
          })),
        })),
      });
      await expect(
        ShippingService.updateOrderShipping(999, 'express', '10.00'),
      ).rejects.toThrow(NotFoundError);
    });
  });
});

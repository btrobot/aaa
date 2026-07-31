import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock helpers ──────────────────────────────────────────────

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown) =>
    new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: (value: unknown) => unknown) => resolve(endValue);
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
      returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ rowCount: 1 })),
    })),
  })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelect(data: unknown[]) {
  mockDb.select.mockReturnValue(createChainMock(data));
}

/** 设置 insert mock 返回指定数据 */
function mockInsertReturn(data: unknown) {
  mockDb.insert.mockReturnValue({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([data])),
    })),
  });
}

const { TaxService } = await import('@/lib/services/tax.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

// ── 测试套件 ─────────────────────────────────────────────────

describe('TaxService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // listTaxClasses
  // ===========================================================================
  describe('listTaxClasses', () => {
    it('应能返回税率类列表（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([
            { id: 1, title: '标准税率', description: '默认' },
          ]);
        }
        return createChainMock([
          { id: 1, taxClassId: 1, name: '增值税', rate: '0.1300', type: 'percentage' },
        ]);
      });

      const result = await TaxService.listTaxClasses();
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('标准税率');
      expect(result[0].rates).toHaveLength(1);
      expect(result[0].rates[0].name).toBe('增值税');
    });

    it('空列表应返回空数组（happy path）', async () => {
      mockSelect([]);
      const result = await TaxService.listTaxClasses();
      expect(result).toEqual([]);
    });
  });

  // ===========================================================================
  // createTaxClass
  // ===========================================================================
  describe('createTaxClass', () => {
    it('应能创建税率类（happy path）', async () => {
      mockInsertReturn({ id: 1, title: '标准税率', description: '默认税率' });
      const result = await TaxService.createTaxClass({
        title: '标准税率',
        description: '默认税率',
      });
      expect(result.id).toBe(1);
      expect(result.title).toBe('标准税率');
      expect(result.description).toBe('默认税率');
    });
  });

  // ===========================================================================
  // createTaxRate — pre: 税率类存在
  // ===========================================================================
  describe('createTaxRate', () => {
    it('应能创建税率（happy path）', async () => {
      mockSelect([{ id: 1, title: '标准税率' }]);
      mockInsertReturn({ id: 1, taxClassId: 1, name: '增值税', rate: '0.1300', type: 'percentage' });
      const result = await TaxService.createTaxRate({
        taxClassId: 1,
        name: '增值税',
        rate: '0.1300',
      });
      expect(result.id).toBe(1);
      expect(result.name).toBe('增值税');
      expect(result.taxClassId).toBe(1);
    });

    it('税率类不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);
      await expect(
        TaxService.createTaxRate({ taxClassId: 999, name: '增值税', rate: '0.1300' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // createTaxRule — pre: taxClassId + taxRateId 存在且属于同一类
  // ===========================================================================
  describe('createTaxRule', () => {
    it('应能创建税务规则（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, title: '标准税率' }]);
        }
        return createChainMock([{ id: 10, taxClassId: 1, name: '增值税', rate: '0.1300' }]);
      });
      mockInsertReturn({ id: 1, taxClassId: 1, taxRateId: 10, basedOn: 'store_address', priority: 1 });

      const result = await TaxService.createTaxRule({
        taxClassId: 1,
        taxRateId: 10,
      });
      expect(result.taxClassId).toBe(1);
      expect(result.taxRateId).toBe(10);
    });

    it('税率类不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);
      await expect(
        TaxService.createTaxRule({ taxClassId: 999, taxRateId: 1 }),
      ).rejects.toThrow(NotFoundError);
    });

    it('税率不存在时应抛出 NotFoundError（pre 违反）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, title: '标准税率' }]);
        }
        return createChainMock([]);
      });

      await expect(
        TaxService.createTaxRule({ taxClassId: 1, taxRateId: 999 }),
      ).rejects.toThrow(NotFoundError);
    });

    it('税率不属于同一类时应抛出 BusinessRuleError（pre 违反）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([{ id: 1, title: '标准税率' }]);
        }
        return createChainMock([{ id: 10, taxClassId: 2, name: '消费税', rate: '0.0500' }]);
      });

      await expect(
        TaxService.createTaxRule({ taxClassId: 1, taxRateId: 10 }),
      ).rejects.toThrow(BusinessRuleError);
    });
  });

  // ===========================================================================
  // calculateTax
  // ===========================================================================
  describe('calculateTax', () => {
    it('应能按优先级匹配规则计算税额（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([
            { id: 1, taxClassId: 1, taxRateId: 10, basedOn: 'store_address', priority: 2 },
            { id: 2, taxClassId: 1, taxRateId: 11, basedOn: 'store_address', priority: 1 },
          ]);
        }
        return createChainMock([{ id: 11, rate: '0.1300' }]);
      });

      const result = await TaxService.calculateTax({
        orderTotal: 100,
        lineItems: [{ taxClassId: 1, subtotal: 100 }],
      });
      expect(result.taxAmount).toBe(13);
      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0].rate).toBe('0.1300');
    });

    it('无匹配规则时应返回零税额（happy path）', async () => {
      mockSelect([]);
      const result = await TaxService.calculateTax({
        orderTotal: 100,
        lineItems: [{ taxClassId: 999, subtotal: 100 }],
      });
      expect(result.taxAmount).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });

    it('税率超过 100% 应抛出 BusinessRuleError（配置错误）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([
            { id: 1, taxClassId: 1, taxRateId: 10, basedOn: 'store_address', priority: 1 },
          ]);
        }
        return createChainMock([{ id: 10, rate: '1.5000' }]);
      });

      await expect(
        TaxService.calculateTax({
          orderTotal: 100,
          lineItems: [{ taxClassId: 1, subtotal: 100 }],
        }),
      ).rejects.toThrow(BusinessRuleError);
    });
  });
});

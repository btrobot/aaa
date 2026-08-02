import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── 链式查询 Mock 工具 ─────────────────────────────────────────
function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown): unknown =>
    new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: (v: unknown) => unknown) => resolve(endValue);
        if (prop === 'catch') return () => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply() { return Promise.resolve(endValue); },
    });
  return buildChain(resolvedValue);
}

// ── DB Mock ────────────────────────────────────────────────────
const mockDb = {
  select: vi.fn(() => createChainMock([])),
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{
        id: 1, name: 'VIP客户', description: 'VIP分组', discount: '10.00',
      }])),
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve(undefined)),
    })),
  })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelect(data: unknown[]) {
  mockDb.select.mockReturnValue(createChainMock(data));
}

const { CustomerGroupService } = await import('@/lib/services/customer-group.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

describe('CustomerGroupService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // list
  // ===========================================================================
  describe('list', () => {
    it('应返回客户分组列表（happy path）', async () => {
      mockSelect([
        { id: 1, name: 'VIP客户', discount: '10.00' },
        { id: 2, name: '普通客户', discount: '0.00' },
      ]);

      const result = await CustomerGroupService.list();
      expect(result).toHaveLength(2);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('无分组时应返回空列表', async () => {
      mockSelect([]);
      const result = await CustomerGroupService.list();
      expect(result).toEqual([]);
    });
  });

  // ===========================================================================
  // findById
  // ===========================================================================
  describe('findById', () => {
    it('分组存在时应返回分组详情（happy path）', async () => {
      mockSelect([{ id: 1, name: 'VIP客户', discount: '10.00' }]);

      const result = await CustomerGroupService.findById(1);
      expect(result).toHaveProperty('name', 'VIP客户');
    });

    it('分组不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(CustomerGroupService.findById(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // create
  // ===========================================================================
  describe('create', () => {
    const input = { name: 'VIP客户', description: 'VIP分组', discount: '10.00' };

    it('应能创建客户分组（happy path）', async () => {
      const result = await CustomerGroupService.create(input);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'VIP客户');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('名称空时应抛出 ZodError', async () => {
      await expect(CustomerGroupService.create({ name: '' }))
        .rejects.toThrow();
    });

    it('折扣率超出范围时应抛出 BusinessRuleError（rule: 折扣率 0-100）', async () => {
      await expect(CustomerGroupService.create({ name: 'X', discount: '150' }))
        .rejects.toThrow();
    });
  });

  // ===========================================================================
  // update
  // ===========================================================================
  describe('update', () => {
    it('应能更新客户分组（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 1 }]);
        return createChainMock([{ id: 1, name: 'VIP客户-更新' }]);
      });

      const result = await CustomerGroupService.update(1, { name: 'VIP客户-更新' });
      expect(result).toHaveProperty('name', 'VIP客户-更新');
    });

    it('分组不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(CustomerGroupService.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // delete
  // ===========================================================================
  describe('delete', () => {
    it('无关联客户时应成功删除（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 1 }]); // 分组存在
        return createChainMock([]); // 无关联客户
      });

      const result = await CustomerGroupService.delete(1);
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('分组不存在时应抛出 NotFoundError（pre: 分组存在）', async () => {
      mockSelect([]);

      await expect(CustomerGroupService.delete(999)).rejects.toThrow(NotFoundError);
    });

    it('分组有关联客户时应抛出 BusinessRuleError（pre: 分组无关联客户）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 1 }]); // 分组存在
        return createChainMock([{ id: 10 }]); // 有关联客户
      });

      await expect(CustomerGroupService.delete(1)).rejects.toThrow(BusinessRuleError);
    });
  });
});
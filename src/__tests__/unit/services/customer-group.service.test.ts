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
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: 1, name: 'VIP客户-更新', description: 'VIP分组', discount: '10.00',
        }])),
      })),
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
  let service: InstanceType<typeof CustomerGroupService>;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new CustomerGroupService();
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

      const result = await service.list();
      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(2);
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('无分组时应返回空列表', async () => {
      mockSelect([]);
      const result = await service.list();
      expect(result.items).toEqual([]);
    });
  });

  // ===========================================================================
  // getById
  // ===========================================================================
  describe('getById', () => {
    it('分组存在时应返回分组详情（happy path）', async () => {
      mockSelect([{ id: 1, name: 'VIP客户', discount: '10.00' }]);

      const result = await service.getById(1);
      expect(result).toHaveProperty('name', 'VIP客户');
    });

    it('分组不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(service.getById(999)).rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // create
  // ===========================================================================
  describe('create', () => {
    const input = { name: 'VIP客户', description: 'VIP分组', discount: '10.00' };

    it('应能创建客户分组（happy path）', async () => {
      mockSelect([]); // 名称不重复

      const result = await service.create(input);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'VIP客户');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('分组名已存在时应抛出 BusinessRuleError（pre: 分组名唯一）', async () => {
      mockSelect([{ id: 99 }]);

      await expect(service.create(input)).rejects.toThrow(BusinessRuleError);
    });

    it('折扣率超出范围时应抛出 BusinessRuleError（rule: 折扣率 0-100）', async () => {
      mockSelect([]);

      await expect(service.create({ name: 'X', discount: '150' }))
        .rejects.toThrow(BusinessRuleError);
    });

    it('折扣率为负数时应抛出 BusinessRuleError', async () => {
      mockSelect([]);

      await expect(service.create({ name: 'X', discount: '-5' }))
        .rejects.toThrow(BusinessRuleError);
    });
  });

  // ===========================================================================
  // update
  // ===========================================================================
  describe('update', () => {
    it('应能更新客户分组（happy path）', async () => {
      // 第 1 次 select → pre 检查存在；第 2 次 → update returning
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 1 }]);
        return createChainMock([]);
      });

      const result = await service.update(1, { name: 'VIP客户-更新' });
      expect(result).toHaveProperty('name', 'VIP客户-更新');
    });

    it('分组不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(service.update(999, { name: 'X' })).rejects.toThrow(NotFoundError);
    });

    it('折扣率超出范围时应抛出 BusinessRuleError（rule: 折扣率 0-100）', async () => {
      mockSelect([{ id: 1 }]);

      await expect(service.update(1, { discount: '200' })).rejects.toThrow(BusinessRuleError);
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

      const result = await service.delete(1);
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('分组不存在时应抛出 NotFoundError（pre: 分组存在）', async () => {
      mockSelect([]);

      await expect(service.delete(999)).rejects.toThrow(NotFoundError);
    });

    it('分组有关联客户时应抛出 BusinessRuleError（pre: 分组无关联客户）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 1 }]); // 分组存在
        return createChainMock([{ id: 10 }]); // 有关联客户
      });

      await expect(service.delete(1)).rejects.toThrow(BusinessRuleError);
    });
  });
});

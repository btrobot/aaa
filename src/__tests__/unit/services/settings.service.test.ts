import { describe, it, expect, vi, beforeEach } from 'vitest';

function createChainMock(resolvedValue: unknown) {
  const buildChain = (endValue: unknown): Record<string, unknown> =>
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
    values: vi.fn(() => Promise.resolve([{ id: 1 }])),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ rowCount: 1 })),
    })),
  })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelect(data: unknown[]) {
  mockDb.select.mockReturnValue(createChainMock(data));
}

const { SettingsService } = await import('@/lib/services/settings.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

describe('SettingsService', () => {
  let svc: InstanceType<typeof SettingsService>;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new SettingsService();
  });

  // ===========================================================================
  // getAll
  // ===========================================================================
  describe('getAll', () => {
    it('应能返回所有设置（happy path）', async () => {
      mockSelect([
        { key: 'store_name', value: 'NodeCoda', locale: null },
        { key: 'order_prefix', value: 'NC-', locale: null },
      ]);

      const result = await svc.getAll();
      expect(result).toEqual({ store_name: 'NodeCoda', order_prefix: 'NC-' });
    });

    it('应能按 locale 覆盖全局设置（happy path）', async () => {
      mockSelect([
        { key: 'store_name', value: 'NodeCoda', locale: null },
        { key: 'store_name', value: '节点码', locale: 'zh_cn' },
      ]);

      const result = await svc.getAll('zh_cn');
      expect(result).toEqual({ store_name: '节点码' });
    });

    it('无设置数据时应返回空对象（happy path）', async () => {
      mockSelect([]);
      const result = await svc.getAll();
      expect(result).toEqual({});
    });
  });

  // ===========================================================================
  // updateAll
  // ===========================================================================
  describe('updateAll', () => {
    it('应能批量更新设置（happy path）', async () => {
      // updateAll 中 existing 查询 → call 1: 返回空
      // getAll 回调 → call 2: 返回全部数据
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // updateAll 中的 existing 查询：未找到
          return createChainMock([]);
        }
        // getAll 回调：返回已更新的数据
        return createChainMock([
          { key: 'store_name', value: 'NewStore', locale: null },
        ]);
      });

      const result = await svc.updateAll({ store_name: 'NewStore' });
      expect(result).toHaveProperty('store_name', 'NewStore');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('数据为空对象时应抛出 BusinessRuleError（pre 违反）', async () => {
      await expect(svc.updateAll({})).rejects.toThrow(BusinessRuleError);
    });

    it('key 为空字符串时应抛出 BusinessRuleError（pre 违反）', async () => {
      await expect(svc.updateAll({ '': 'value' })).rejects.toThrow(BusinessRuleError);
    });

    it('key 为空白字符串时应抛出 BusinessRuleError（pre 违反）', async () => {
      await expect(svc.updateAll({ '   ': 'value' })).rejects.toThrow(BusinessRuleError);
    });
  });

  // ===========================================================================
  // get
  // ===========================================================================
  describe('get', () => {
    it('应能获取指定设置的值（happy path）', async () => {
      mockSelect([{ value: 'NodeCoda', locale: null }]);

      const result = await svc.get('store_name');
      expect(result).toBe('NodeCoda');
    });

    it('设置不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(svc.get('nonexistent_key')).rejects.toThrow(NotFoundError);
    });

    it('key 为空字符串时应抛出 BusinessRuleError（pre 违反）', async () => {
      await expect(svc.get('')).rejects.toThrow(BusinessRuleError);
    });

    it('key 为空白字符串时应抛出 BusinessRuleError（pre 违反）', async () => {
      await expect(svc.get('   ')).rejects.toThrow(BusinessRuleError);
    });
  });
});

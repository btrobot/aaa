import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  beforeEach(() => {
    vi.clearAllMocks();
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

      const result = await SettingsService.getAll();
      expect(result).toEqual({ store_name: 'NodeCoda', order_prefix: 'NC-' });
    });

    it('无设置数据时应返回空对象（happy path）', async () => {
      mockSelect([]);
      const result = await SettingsService.getAll();
      expect(result).toEqual({});
    });
  });

  // ===========================================================================
  // updateAll
  // ===========================================================================
  describe('updateAll', () => {
    it('应能批量更新设置（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return createChainMock([]);
        }
        return createChainMock([
          { key: 'store_name', value: 'NewStore', locale: null },
        ]);
      });

      const result = await SettingsService.updateAll({ store_name: 'NewStore' });
      expect(result).toHaveProperty('store_name', 'NewStore');
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // get
  // ===========================================================================
  describe('get', () => {
    it('应能获取指定设置的值（happy path）', async () => {
      mockSelect([{ value: 'NodeCoda', locale: null }]);

      const result = await SettingsService.get('store_name');
      expect(result).toBe('NodeCoda');
    });

    it('设置不存在时应返回 null', async () => {
      mockSelect([]);

      const result = await SettingsService.get('nonexistent_key');
      expect(result).toBeNull();
    });
  });
});
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

let callCount = 0;
const mockDb = {
  insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => Promise.resolve(undefined)) })) })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelectSequence(...results: unknown[][]) {
  callCount = 0;
  mockDb.select.mockImplementation(() => {
    const data = results[Math.min(callCount, results.length - 1)];
    callCount++;
    return createChainMock(data);
  });
}

const attr = await import('@/lib/services/attribute.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

describe('AttributeService', () => {
  beforeEach(() => { vi.clearAllMocks(); callCount = 0; });

  describe('createGroup', () => {
    it('应能创建属性组（happy path）', async () => {
      const result = await attr.createGroup({ sortOrder: 0, descriptions: { zh_cn: { name: '颜色' } } });
      expect(result).toHaveProperty('id', 1);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('描述为空时应抛出 BusinessRuleError', async () => {
      await expect(attr.createGroup({ descriptions: {} })).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('updateGroup', () => {
    it('应能更新属性组（happy path）', async () => {
      mockSelectSequence([{ id: 1 }]);
      await attr.updateGroup(1, { sortOrder: 5, descriptions: { zh_cn: { name: '新颜色' } } });
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('属性组不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(attr.updateGroup(999, { descriptions: { zh_cn: { name: 'X' } } })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteGroup', () => {
    it('应能删除属性组（happy path）', async () => {
      mockSelectSequence([{ id: 1 }], []);
      await attr.deleteGroup(1);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('属性组不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(attr.deleteGroup(999)).rejects.toThrow(NotFoundError);
    });

    it('属性组有属性时应抛出 BusinessRuleError', async () => {
      mockSelectSequence([{ id: 1 }], [{ id: 10 }]);
      await expect(attr.deleteGroup(1)).rejects.toThrow(BusinessRuleError);
    });
  });

  describe('createAttribute', () => {
    it('应能创建属性（happy path）', async () => {
      mockSelectSequence([{ id: 1 }]);
      const result = await attr.createAttribute({ attributeGroupId: 1, descriptions: { zh_cn: { name: '红色' } } });
      expect(result).toHaveProperty('id', 1);
    });

    it('属性组不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(attr.createAttribute({ attributeGroupId: 999, descriptions: { zh_cn: { name: 'X' } } })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteAttribute', () => {
    it('应能删除属性（happy path）', async () => {
      mockSelectSequence([{ id: 1 }]);
      await attr.deleteAttribute(1);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('属性不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(attr.deleteAttribute(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('createValue', () => {
    it('应能创建属性值（happy path）', async () => {
      mockSelectSequence([{ id: 1 }]);
      const result = await attr.createValue({ attributeId: 1, descriptions: { zh_cn: { name: '大红' } } });
      expect(result).toHaveProperty('id', 1);
    });

    it('属性不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(attr.createValue({ attributeId: 999, descriptions: { zh_cn: { name: 'X' } } })).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteValue', () => {
    it('应能删除属性值（happy path）', async () => {
      mockSelectSequence([{ id: 1 }]);
      await attr.deleteValue(1);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('属性值不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);
      await expect(attr.deleteValue(999)).rejects.toThrow(NotFoundError);
    });
  });
});

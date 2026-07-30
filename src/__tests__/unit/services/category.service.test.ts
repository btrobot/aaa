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
  insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn(() => ({ returning: vi.fn(() => Promise.resolve([{ id: 1 }])) })) })) })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

const { CategoryService } = await import('@/lib/services/category.service');

describe('CategoryService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('create', () => {
    it('应能创建分类', async () => {
      const result = await CategoryService.create({
        parentId: null,
        status: true,
        descriptions: {
          zh_cn: { name: '旋转木马', description: '旋转木马分类' },
          en: { name: 'Carousels', description: 'Carousel category' },
        },
      });
      expect(result).toEqual({ id: 1 });
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe('getTree', () => {
    it('应返回树形分类结构', async () => {
      mockDb.select.mockReturnValue(createChainMock([
        { categories: { id: 1, parentId: null, status: true }, category_descriptions: { name: '户外大型', locale: 'zh_cn' } },
        { categories: { id: 2, parentId: 1, status: true }, category_descriptions: { name: '过山车', locale: 'zh_cn' } },
        { categories: { id: 3, parentId: 1, status: true }, category_descriptions: { name: '摩天轮', locale: 'zh_cn' } },
      ]));

      const tree = await CategoryService.getTree('zh_cn');
      expect(Array.isArray(tree)).toBe(true);
    });
  });
});
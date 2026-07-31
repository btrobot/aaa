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

let callCount = 0;
const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
    })),
  })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve(undefined)),
    })),
  })),
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

const { CategoryService } = await import('@/lib/services/category.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

describe('CategoryService', () => {
  beforeEach(() => { vi.clearAllMocks(); callCount = 0; });

  // ===========================================================================
  // create
  // ===========================================================================
  describe('create', () => {
    const baseInput = {
      parentId: null,
      slug: 'outdoor',
      sortOrder: 0,
      status: true,
      descriptions: { zh_cn: { name: '户外大型' }, en: { name: 'Outdoor' } },
    };

    it('应能创建顶级分类（happy path）', async () => {
      mockSelectSequence(
        [],       // slug 唯一检查 → 不重复
        [],       // parentId 检查 → 跳过（null）
      );

      const result = await CategoryService.create(baseInput);
      expect(result).toHaveProperty('id', 1);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('slug 已存在时应抛出 BusinessRuleError（pre 违反）', async () => {
      mockSelectSequence([{ id: 99 }]); // slug 已存在

      await expect(CategoryService.create(baseInput))
        .rejects.toThrow(BusinessRuleError);
    });

    it('parentId 指向不存在的分类时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelectSequence(
        [],   // slug 唯一 → OK
        [],   // parentId 查询 → 不存在
      );

      await expect(CategoryService.create({ ...baseInput, parentId: 999 }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // getTree
  // ===========================================================================
  describe('getTree', () => {
    it('应返回树形分类结构', async () => {
      mockSelectSequence([
        { categories: { id: 1, parentId: null, slug: 'root', sortOrder: 0, status: true }, category_descriptions: { name: '根分类' } },
        { categories: { id: 2, parentId: 1, slug: 'child', sortOrder: 0, status: true }, category_descriptions: { name: '子分类' } },
      ]);

      const tree = await CategoryService.getTree('zh_cn');
      expect(tree.length).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // findById
  // ===========================================================================
  describe('findById', () => {
    it('应能找到分类（happy path）', async () => {
      mockSelectSequence([
        { categories: { id: 1, parentId: null, slug: 'root', status: true }, category_descriptions: { name: '根' } },
      ]);

      const result = await CategoryService.findById(1);
      expect(result).toBeDefined();
    });

    it('分类不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelectSequence([]);

      await expect(CategoryService.findById(999))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // update
  // ===========================================================================
  describe('update', () => {
    it('应能更新分类（happy path）', async () => {
      mockSelectSequence(
        [{ categories: { id: 1 }, category_descriptions: { name: '旧' } }], // findById
      );

      const result = await CategoryService.update(1, { slug: 'new-slug' });
      expect(result).toHaveProperty('id', 1);
    });

    it('分类不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelectSequence([]);

      await expect(CategoryService.update(999, { slug: 'x' }))
        .rejects.toThrow(NotFoundError);
    });

    it('parentId 指向自身时应抛出 BusinessRuleError（防循环）', async () => {
      mockSelectSequence(
        [{ categories: { id: 1 }, category_descriptions: { name: 'A' } }], // findById
      );

      await expect(CategoryService.update(1, { parentId: 1 }))
        .rejects.toThrow(BusinessRuleError);
    });
  });

  // ===========================================================================
  // delete
  // ===========================================================================
  describe('delete', () => {
    it('应能删除分类（happy path）', async () => {
      mockSelectSequence(
        [{ categories: { id: 1 }, category_descriptions: { name: 'A' } }], // findById
        [],  // 无子分类
        [],  // 无关联产品
      );

      const result = await CategoryService.delete(1);
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('分类不存在时应抛出 NotFoundError（pre-1 违反）', async () => {
      mockSelectSequence([]);

      await expect(CategoryService.delete(999))
        .rejects.toThrow(NotFoundError);
    });

    it('有子分类时应抛出 BusinessRuleError（pre-2 违反）', async () => {
      mockSelectSequence(
        [{ categories: { id: 1 }, category_descriptions: { name: 'A' } }], // findById
        [{ id: 2 }], // 有子分类
      );

      await expect(CategoryService.delete(1))
        .rejects.toThrow(BusinessRuleError);
    });

    it('有关联产品时应抛出 BusinessRuleError（pre-3 违反）', async () => {
      mockSelectSequence(
        [{ categories: { id: 1 }, category_descriptions: { name: 'A' } }], // findById
        [],  // 无子分类
        [{ productId: 10 }], // 有关联产品
      );

      await expect(CategoryService.delete(1))
        .rejects.toThrow(BusinessRuleError);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── 链式查询 Mock ─────────────────────────────────────────────
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

const pageRow = (overrides: Record<string, unknown> = {}) => ({
  pages: {
    id: 1, slug: 'test-page', author: null, image: null,
    status: true, sortOrder: 0,
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
    ...overrides,
  },
  page_descriptions: {
    id: 1, pageId: 1, locale: 'zh_cn',
    title: '测试页面', content: '内容', summary: '摘要',
    metaTitle: null, metaDescription: null, metaKeywords: null,
  },
});

const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{
        id: 1, slug: 'test-page', author: null, image: null,
        status: true, sortOrder: 0,
        createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-01'),
      }])),
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

function mockSelect(data: unknown[]) {
  mockDb.select.mockReturnValue(createChainMock(data));
}

const { PageService } = await import('@/lib/services/page.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

describe('PageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================================================
  // search
  // ===========================================================================
  describe('search', () => {
    it('应返回页面列表（happy path）', async () => {
      mockSelect([pageRow(), pageRow({ id: 2, slug: 'page-2' })]);

      const result = await PageService.search({ locale: 'zh_cn' });
      expect(result.items).toHaveLength(2);
      expect(result.items[0]).toHaveProperty('title', '测试页面');
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('应支持 status 筛选', async () => {
      mockSelect([pageRow()]);

      const result = await PageService.search({ status: true });
      expect(result.items).toHaveLength(1);
    });

    it('应支持分页参数', async () => {
      mockSelect([]);

      await PageService.search({ page: 2, pageSize: 5 });
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // getById
  // ===========================================================================
  describe('getById', () => {
    it('应能获取页面详情（happy path）', async () => {
      mockSelect([pageRow()]);

      const result = await PageService.getById(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('title', '测试页面');
      expect(result).toHaveProperty('summary', '摘要');
    });

    it('页面不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(PageService.getById(999))
        .rejects.toThrow(NotFoundError);
    });

    it('应支持指定 locale', async () => {
      const enRow = pageRow();
      enRow.page_descriptions = { ...enRow.page_descriptions, locale: 'en', title: 'Test Page' };
      mockSelect([enRow]);

      const result = await PageService.getById(1, 'en');
      expect(result).toHaveProperty('title', 'Test Page');
    });
  });

  // ===========================================================================
  // create
  // ===========================================================================
  describe('create', () => {
    const createData = {
      status: true,
      sortOrder: 0,
      descriptions: { zh_cn: { title: '新页面' } },
    };

    it('应能创建页面（happy path）', async () => {
      mockSelect([]);

      const result = await PageService.create(createData);
      expect(result).toHaveProperty('id', 1);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('应校验 zod schema — descriptions.title 为空', async () => {
      await expect(PageService.create({ status: true, sortOrder: 0, descriptions: { zh_cn: { title: '' } } }))
        .rejects.toThrow();
    });
  });

  // ===========================================================================
  // update
  // ===========================================================================
  describe('update', () => {
    it('应能更新页面（happy path）', async () => {
      mockSelect([pageRow({ id: 1, slug: 'updated' })]);

      const result = await PageService.update(1, { status: false });
      expect(result).toHaveProperty('slug', 'updated');
    });

    it('页面不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(PageService.update(999, { status: false }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // delete
  // ===========================================================================
  describe('delete', () => {
    it('应能删除页面（happy path）', async () => {
      mockSelect([pageRow()]);

      const result = await PageService.delete(1);
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('页面不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(PageService.delete(999))
        .rejects.toThrow(NotFoundError);
    });
  });
});
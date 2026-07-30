import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── 链式查询 Mock ─────────────────────────────────────────────
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
  let svc: InstanceType<typeof PageService>;

  beforeEach(() => {
    vi.clearAllMocks();
    svc = new PageService();
  });

  // ===========================================================================
  // search
  // ===========================================================================
  describe('search', () => {
    it('应返回页面列表（happy path）', async () => {
      mockSelect([pageRow(), pageRow({ id: 2, slug: 'page-2' })]);

      const result = await svc.search({ locale: 'zh_cn' });
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('title', '测试页面');
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('应支持 status 筛选', async () => {
      mockSelect([pageRow()]);

      const result = await svc.search({ status: true });
      expect(result).toHaveLength(1);
    });

    it('应支持分页参数', async () => {
      mockSelect([]);

      await svc.search({ page: 2, pageSize: 5 });
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // getById
  // ===========================================================================
  describe('getById', () => {
    it('应能获取页面详情（happy path）', async () => {
      mockSelect([pageRow()]);

      const result = await svc.getById(1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('title', '测试页面');
      expect(result).toHaveProperty('summary', '摘要');
    });

    it('页面不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(svc.getById(999))
        .rejects.toThrow(NotFoundError);
    });

    it('应支持指定 locale', async () => {
      const enRow = pageRow();
      enRow.page_descriptions = { ...enRow.page_descriptions, locale: 'en', title: 'Test Page' };
      mockSelect([enRow]);

      const result = await svc.getById(1, 'en');
      expect(result).toHaveProperty('title', 'Test Page');
    });
  });

  // ===========================================================================
  // create
  // ===========================================================================
  describe('create', () => {
    const createData = {
      slug: 'new-page',
      descriptions: { zh_cn: { title: '新页面' } },
    };

    it('应能创建页面（happy path）', async () => {
      mockSelect([]);

      const result = await svc.create(createData);
      expect(result).toHaveProperty('id', 1);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('slug 已存在时应抛出 BusinessRuleError（pre 违反）', async () => {
      mockSelect([{ id: 99 }]);

      await expect(svc.create(createData))
        .rejects.toThrow(BusinessRuleError);
    });

    it('无 slug 时应跳过唯一性检查', async () => {
      mockSelect([]);

      const result = await svc.create({ descriptions: { zh_cn: { title: '无 slug' } } });
      expect(result).toHaveProperty('id', 1);
    });

    it('应校验 zod schema — descriptions.title 为空', async () => {
      await expect(svc.create({ descriptions: { zh_cn: { title: '' } } }))
        .rejects.toThrow();
    });
  });

  // ===========================================================================
  // update
  // ===========================================================================
  describe('update', () => {
    it('应能更新页面（happy path）', async () => {
      mockSelect([pageRow({ id: 1, slug: 'updated' })]);

      const result = await svc.update(1, { slug: 'updated' });
      expect(result).toHaveProperty('slug', 'updated');
    });

    it('页面不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(svc.update(999, { slug: 'x' }))
        .rejects.toThrow(NotFoundError);
    });

    it('应能更新描述（已有 locale → update）', async () => {
      // callCount: 1=getById(pre), 2=查已有描述, 3=getById(return)
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1 || callCount === 3) return createChainMock([pageRow()]);
        if (callCount === 2) return createChainMock([{ id: 1, pageId: 1, locale: 'zh_cn' }]);
        return createChainMock([]);
      });

      const result = await svc.update(1, { descriptions: { zh_cn: { title: '新标题' } } });
      expect(result).toHaveProperty('id', 1);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('应能插入新 locale 描述（不存在 → insert）', async () => {
      // callCount: 1=getById(pre), 2=查已有描述(不存在), 3=getById(return)
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1 || callCount === 3) return createChainMock([pageRow()]);
        return createChainMock([]);
      });

      await svc.update(1, { descriptions: { en: { title: 'English' } } });
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // delete
  // ===========================================================================
  describe('delete', () => {
    it('应能删除页面（happy path）', async () => {
      mockSelect([pageRow()]);

      const result = await svc.delete(1);
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('页面不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(svc.delete(999))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // listCategories
  // ===========================================================================
  describe('listCategories', () => {
    const catRow = (overrides: Record<string, unknown> = {}) => ({
      page_categories: {
        id: 1, parentId: null, image: null,
        sortOrder: 0, status: true,
        ...overrides,
      },
      page_category_descriptions: {
        id: 1, pageCategoryId: 1, locale: 'zh_cn',
        name: '新闻', description: '新闻分类',
      },
    });

    it('应返回文章分类列表（happy path）', async () => {
      mockSelect([catRow(), catRow({ id: 2 })]);

      const result = await svc.listCategories('zh_cn');
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('name', '新闻');
      expect(result[0]).toHaveProperty('description', '新闻分类');
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('无分类时应返回空数组（happy path）', async () => {
      mockSelect([]);

      const result = await svc.listCategories();
      expect(result).toHaveLength(0);
    });

    it('应支持指定 locale', async () => {
      const enRow = catRow();
      enRow.page_category_descriptions = {
        ...enRow.page_category_descriptions,
        locale: 'en', name: 'News', description: 'News category',
      };
      mockSelect([enRow]);

      const result = await svc.listCategories('en');
      expect(result[0]).toHaveProperty('name', 'News');
    });

    it('应按 sortOrder 排序', async () => {
      mockSelect([catRow({ id: 1, sortOrder: 10 }), catRow({ id: 2, sortOrder: 5 })]);

      const result = await svc.listCategories();
      expect(result).toHaveLength(2);
      expect(mockDb.select).toHaveBeenCalled();
    });
  });
});

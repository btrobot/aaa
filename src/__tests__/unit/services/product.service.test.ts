import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, BusinessRuleError } from '@/lib/services/errors';

// ─── 链式 Mock 工厂 ──────────────────────────────────────────
// 支持 select() 按序返回不同结果，每次 .from().where() 返回同一 resolvedValue
function createChain(resolvedValue: unknown) {
  const chain: Record<string, unknown> = {};
  chain.from = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.leftJoin = vi.fn(() => chain);
  chain.orderBy = vi.fn(() => chain);
  chain.limit = vi.fn(() => chain);
  chain.offset = vi.fn(() => chain);
  // thenable — 让 await 直接 resolve
  chain.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resolvedValue).then(resolve);
  return chain;
}

// ─── 可配置序列 db mock ──────────────────────────────────────
function createSequenceDb() {
  const selectResults: unknown[] = [];
  let selectIdx = 0;

  const mockDb = {
    select: vi.fn(() => {
      const result = selectResults[selectIdx] ?? [];
      selectIdx++;
      return createChain(result);
    }),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  };

  return {
    mockDb,
    /** 设置下一批 select 按序返回的结果（调用前重置索引） */
    mockSelectSequence(...results: unknown[]) {
      selectResults.length = 0;
      selectResults.push(...results);
      selectIdx = 0;
    },
    /** 重置所有 mock 并清空序列 */
    resetAll() {
      vi.clearAllMocks();
      selectResults.length = 0;
      selectIdx = 0;
    },
  };
}

const { mockDb, mockSelectSequence, resetAll } = createSequenceDb();

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

const { ProductService } = await import('@/lib/services/product.service');

// ============================================================

describe('ProductService', () => {
  beforeEach(() => resetAll());

  // ─── create ────────────────────────────────────────────────
  describe('create', () => {
    const baseInput = {
      status: true,
      quantity: 0,
      sortOrder: 0,
      sku: 'SKU-001',
      price: '99.99',
      descriptions: { zh_cn: { name: '测试商品' } },
    };

    it('应能创建商品并返回商品 ID', async () => {
      mockSelectSequence([]);

      const result = await ProductService.create(baseInput);
      expect(result).toEqual({ id: 1 });
    });

    it('SKU 已存在时应抛出 BusinessRuleError', async () => {
      mockSelectSequence([{ id: 99 }]);

      const err = await ProductService.create(baseInput).catch(e => e);
      expect(err).toBeInstanceOf(BusinessRuleError);
      expect(err.message).toMatch(/SKU.*已存在/);
    });

    it('brandId 对应品牌不存在时应抛出 BusinessRuleError', async () => {
      mockSelectSequence([], []);

      const err = await ProductService.create({ ...baseInput, brandId: 999 }).catch(e => e);
      expect(err).toBeInstanceOf(BusinessRuleError);
    });

    it('categoryIds 中存在不存在的分类时应抛出 BusinessRuleError', async () => {
      mockSelectSequence([], []);

      const err = await ProductService.create({ ...baseInput, categoryIds: [999] }).catch(e => e);
      expect(err).toBeInstanceOf(BusinessRuleError);
    });

    it('品牌和分类均存在时应正常创建', async () => {
      mockSelectSequence([], [{ id: 1 }], [{ id: 10 }]);

      const result = await ProductService.create({
        ...baseInput,
        brandId: 1,
        categoryIds: [10],
      });
      expect(result).toEqual({ id: 1 });
    });

    it('创建商品时 SKU 不能为空（Zod 校验）', async () => {
      await expect(
        ProductService.create({
          sku: '',
          price: '100.00',
          status: true,
          quantity: 0,
          sortOrder: 0,
          descriptions: { zh_cn: { name: '测试' } },
        })
      ).rejects.toThrow('SKU 不能为空');
    });
  });

  // ─── findById ──────────────────────────────────────────────
  describe('findById', () => {
    it('商品不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);

      await expect(ProductService.findById(999))
        .rejects.toThrow(NotFoundError);
    });

    it('商品存在时应返回完整详情', async () => {
      const mockProduct = {
        products: { id: 1, sku: 'SKU-001', price: '99.99', status: true },
        product_descriptions: { locale: 'zh_cn', name: '测试商品' },
        brands: { id: 1, name: '测试品牌' },
      };

      mockSelectSequence(
        [mockProduct],
        [{ id: 1, productId: 1, image: '/img.jpg', sortOrder: 0 }],
        [{ productId: 1, categoryId: 10 }],
      );

      const result = await ProductService.findById(1);
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.brand).toEqual({ id: 1, name: '测试品牌' });
    });
  });

  // ─── update ────────────────────────────────────────────────
  describe('update', () => {
    it('产品不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);

      await expect(ProductService.update(999, { price: '100.00' }))
        .rejects.toThrow(NotFoundError);
    });

    it('产品存在时应正常更新', async () => {
      mockSelectSequence([{ id: 1 }]);

      const result = await ProductService.update(1, { price: '88888.00' });
      expect(result).toEqual({ id: 1 });
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  // ─── delete ────────────────────────────────────────────────
  describe('delete', () => {
    it('产品不存在时应抛出 NotFoundError', async () => {
      mockSelectSequence([]);

      await expect(ProductService.delete(999))
        .rejects.toThrow(NotFoundError);
    });

    it('产品有关联订单时应抛出 BusinessRuleError', async () => {
      mockSelectSequence([{ id: 1 }], [{ id: 100 }]);

      const err = await ProductService.delete(1).catch(e => e);
      expect(err).toBeInstanceOf(BusinessRuleError);
      expect(err.message).toMatch(/关联订单/);
    });

    it('产品存在且无关联订单时应成功删除', async () => {
      mockSelectSequence([{ id: 1 }], []);

      const result = await ProductService.delete(1);
      expect(result).toBe(true);
    });
  });

  // ─── search ────────────────────────────────────────────────
  describe('search', () => {
    it('应支持关键词搜索', async () => {
      const mockRows = [
        { products: { id: 1, sku: 'SKU-001', price: '99.99' }, product_descriptions: { name: '旋转木马' } },
        { products: { id: 2, sku: 'SKU-002', price: '199.99' }, product_descriptions: { name: '过山车' } },
      ];
      mockSelectSequence(mockRows);

      const result = await ProductService.search({
        keyword: '旋转木马',
        locale: 'zh_cn',
        page: 1,
        pageSize: 20,
        sortBy: 'sortOrder',
        sortOrder: 'desc',
      });
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
    });

    it('应支持按分类筛选', async () => {
      mockSelectSequence([], []);

      const result = await ProductService.search({
        categoryId: 1,
        locale: 'zh_cn',
        page: 1,
        pageSize: 20,
        sortBy: 'sortOrder',
        sortOrder: 'desc',
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  // ─── getHotProducts ────────────────────────────────────────
  describe('getHotProducts', () => {
    it('应返回热销商品列表', async () => {
      const mockProducts = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        sku: `HOT-${i + 1}`,
        price: '99.99',
        sales: 100 - i,
        status: true,
      }));
      mockSelectSequence(mockProducts);

      const result = await ProductService.getHotProducts(8);
      expect(result).toHaveLength(8);
    });
  });
});

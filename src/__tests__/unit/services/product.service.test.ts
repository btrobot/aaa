import { describe, it, expect, vi, beforeEach } from 'vitest';

// 通用链式 mock 工厂 - 支持任意深度的链式调用
function createChainMock(resolvedValue: any) {
  const buildChain = (endValue: any) => {
    return new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve(endValue);
        if (prop === 'catch') return (reject?: Function) => Promise.resolve(endValue);
        // 所有方法都返回一个新的链式 mock
        return () => buildChain(endValue);
      },
      apply(_, __, args) {
        return Promise.resolve(endValue);
      },
    });
  };
  return buildChain(resolvedValue);
}

// 创建 mock db
function createMockDb() {
  const defaultResolve = Promise.resolve([]);

  const db = {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
      })),
    })),
    select: vi.fn(() => createChainMock([])),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: 1 }])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve({ rowCount: 1 })),
    })),
  };

  return db;
}

const mockDb = createMockDb();

vi.mock('@/lib/db/db', () => ({
  db: mockDb,
}));

const { ProductService } = await import('@/lib/services/product.service');

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('应能创建商品并返回商品 ID', async () => {
      const result = await ProductService.create({
        sku: 'MER-GO-001',
        price: '99999.00',
        brandId: 1,
        status: true,
        quantity: 0,
        sortOrder: 0,
        descriptions: {
          zh_cn: { name: '经典旋转木马', description: '双层豪华旋转木马' },
          en: { name: 'Classic Carousel', description: 'Double-deck luxury carousel' },
        },
      });

      expect(result).toEqual({ id: 1 });
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('创建商品时 SKU 不能为空', async () => {
      await expect(
        ProductService.create({
          sku: '',
          price: '100.00',
          status: true,
          quantity: 0,
          sortOrder: 0,
          descriptions: { zh_cn: { name: '测试商品' } },
        })
      ).rejects.toThrow('SKU 不能为空');
    });
  });

  describe('findById', () => {
    it('应能根据 ID 查找商品 - 返回空数据时返回 null', async () => {
      // 第一个 select 返回空数组 → 返回 null
      mockDb.select.mockReturnValue(createChainMock([]));

      const result = await ProductService.findById(999);
      expect(result).toBeNull();
    });

    it('商品存在时应返回商品详情', async () => {
      const mockProduct = {
        products: { id: 1, sku: 'MER-001', price: '99.99', status: true },
        product_descriptions: { locale: 'zh_cn', name: '测试商品' },
        brands: { id: 1, name: '测试品牌' },
      };

      // 主查询返回数据
      mockDb.select.mockReturnValueOnce(createChainMock([mockProduct]))
        // 图片查询
        .mockReturnValueOnce(createChainMock([
          { id: 1, productId: 1, image: '/img1.jpg', sortOrder: 0 },
        ]))
        // 分类查询
        .mockReturnValueOnce(createChainMock([
          { id: 1, productId: 1, categoryId: 1 },
        ]));

      const result = await ProductService.findById(1);
      expect(result).toBeDefined();
      expect(result!.id).toBe(1);
    });
  });

  describe('search', () => {
    it('应支持关键词搜索', async () => {
      const mockProducts = [
        { products: { id: 1, sku: 'MER-001', price: '99.99', status: true }, product_descriptions: { locale: 'zh_cn', name: '旋转木马' } },
        { products: { id: 2, sku: 'MER-002', price: '199.99', status: true }, product_descriptions: { locale: 'zh_cn', name: '过山车' } },
      ];

      mockDb.select.mockReturnValue(createChainMock(mockProducts));

      const result = await ProductService.search({ keyword: '旋转木马', locale: 'zh_cn', page: 1, pageSize: 20, sortBy: 'sort_order', sortOrder: 'desc' });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('应支持按分类筛选', async () => {
      const mockProducts = [
        { products: { id: 3, sku: 'MER-003', price: '299.99' }, product_descriptions: null },
      ];

      mockDb.select.mockReturnValueOnce(createChainMock([]))
        .mockReturnValueOnce(createChainMock(mockProducts));

      const result = await ProductService.search({ categoryId: 1, locale: 'zh_cn', page: 1, pageSize: 20, sortBy: 'sort_order', sortOrder: 'desc' });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('update', () => {
    it('应能更新商品信息', async () => {
      const result = await ProductService.update(1, {
        price: '88888.00',
        status: true,
      });

      expect(result).toBeDefined();
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('应能删除商品', async () => {
      const result = await ProductService.delete(1);
      expect(result).toBe(true);
    });

    it('删除不存在的商品应返回 false', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn(() => Promise.resolve({ rowCount: 0 })),
      });

      const result = await ProductService.delete(999);
      expect(result).toBe(false);
    });
  });

  describe('getHotProducts', () => {
    it('应返回热销商品列表', async () => {
      const mockProducts = Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        sku: `HOT-${i + 1}`,
        price: '99.99',
        sales: 100 - i,
        status: true,
      }));

      mockDb.select.mockReturnValue(createChainMock(mockProducts));

      const result = await ProductService.getHotProducts(8);
      expect(result).toHaveLength(8);
    });
  });

  describe('update', () => {
    it('应能更新产品信息', async () => {
      mockDb.update = vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 1, sku: 'TEST-001', price: '199.99' }])),
          })),
        })),
      }));

      const result = await ProductService.update(1, { price: '199.99' });
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('findById', () => {
    it('应能通过 ID 获取产品', async () => {
      mockDb.select.mockReturnValue(createChainMock([{ products: { id: 1, sku: 'TEST-001', price: '99.99' }, product_descriptions: null, brands: null }]));

      const result = await ProductService.findById(1);
      expect(result).toHaveProperty('id', 1);
    });

    it('产品不存在时应返回 null', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      const result = await ProductService.findById(999);
      expect(result).toBeNull();
    });
  });
});
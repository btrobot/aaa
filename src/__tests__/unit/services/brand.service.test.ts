import { describe, it, expect, vi, beforeEach } from 'vitest';

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

let selectData: unknown[] = [];
const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn(() => ({
      returning: vi.fn(() => Promise.resolve([{
        id: 1, name: 'Test Brand', logo: null, description: null,
        website: null, sortOrder: 0, status: true,
        createdAt: new Date(), updatedAt: new Date(),
      }])),
    })),
  })),
  select: vi.fn(() => createChainMock([])),
  update: vi.fn(() => ({
    set: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: 1, name: 'Updated Brand', logo: 'new-logo.png',
          description: null, website: null, sortOrder: 0, status: true,
          createdAt: new Date(), updatedAt: new Date(),
        }])),
      })),
    })),
  })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve({ rowCount: 1 })) })),
};

vi.mock('@/lib/db/db', () => ({ db: mockDb }));

function mockSelect(data: unknown[]) {
  selectData = data;
  mockDb.select.mockReturnValue(createChainMock(data));
}

const { BrandService } = await import('@/lib/services/brand.service');
const { NotFoundError, BusinessRuleError } = await import('@/lib/services/errors');

describe('BrandService', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // create
  // ===========================================================================
  describe('create', () => {
    const brandData = { name: 'Test Brand', description: 'A test brand', website: 'https://test.com' };

    it('应能创建品牌（happy path）', async () => {
      mockSelect([]); // 品牌名不存在

      const result = await BrandService.create(brandData);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Test Brand');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('品牌名已存在时应抛出 BusinessRuleError（pre 违反）', async () => {
      mockSelect([{ id: 99 }]); // 品牌名已存在

      await expect(BrandService.create(brandData))
        .rejects.toThrow(BusinessRuleError);
    });

    it('应校验 zod schema — name 为空字符串', async () => {
      await expect(BrandService.create({ name: '' }))
        .rejects.toThrow();
    });
  });

  // ===========================================================================
  // findById
  // ===========================================================================
  describe('findById', () => {
    it('应能找到品牌（happy path）', async () => {
      mockSelect([{ id: 1, name: 'Test Brand', status: true }]);

      const result = await BrandService.findById(1);
      expect(result).toHaveProperty('name', 'Test Brand');
    });

    it('品牌不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(BrandService.findById(999))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // findAll
  // ===========================================================================
  describe('findAll', () => {
    it('应返回品牌列表（默认分页）', async () => {
      mockSelect([
        { id: 1, name: 'Brand A', status: true },
        { id: 2, name: 'Brand B', status: true },
      ]);

      const result = await BrandService.findAll();
      expect(result).toHaveLength(2);
    });

    it('应支持按 status 筛选', async () => {
      mockSelect([{ id: 1, name: 'Active Brand', status: true }]);

      const result = await BrandService.findAll({ status: true });
      expect(result).toHaveLength(1);
    });

    it('应支持 asc/desc 排序', async () => {
      mockSelect([{ id: 1, name: 'Brand' }]);

      await BrandService.findAll({ sort: 'asc' });
      expect(mockDb.select).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // update
  // ===========================================================================
  describe('update', () => {
    it('应能更新品牌（happy path）', async () => {
      // 先 findById → 存在
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 1, name: 'Old' }]);
        return createChainMock([]);
      });

      const result = await BrandService.update(1, { name: 'Updated Brand', logo: 'new-logo.png' });
      expect(result).toHaveProperty('name', 'Updated Brand');
    });

    it('品牌不存在时应抛出 NotFoundError（pre 违反）', async () => {
      mockSelect([]);

      await expect(BrandService.update(999, { name: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ===========================================================================
  // delete
  // ===========================================================================
  describe('delete', () => {
    it('应能删除品牌（happy path）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 1, name: 'Brand' }]); // findById
        return createChainMock([]); // 无关联产品
      });

      const result = await BrandService.delete(1);
      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('品牌不存在时应抛出 NotFoundError（pre-1 违反）', async () => {
      mockSelect([]);

      await expect(BrandService.delete(999))
        .rejects.toThrow(NotFoundError);
    });

    it('品牌有关联产品时应抛出 BusinessRuleError（pre-2 违反）', async () => {
      let callCount = 0;
      mockDb.select.mockImplementation(() => {
        callCount++;
        if (callCount === 1) return createChainMock([{ id: 1, name: 'Brand' }]); // findById
        return createChainMock([{ id: 10 }]); // 有关联产品
      });

      await expect(BrandService.delete(1))
        .rejects.toThrow(BusinessRuleError);
    });
  });
});

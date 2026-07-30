import { describe, it, expect, vi, beforeEach } from 'vitest';
import { brands } from '@/lib/db/schema';

function createChainMock(resolvedValue: any) {
  const buildChain = (endValue: any) => {
    return new Proxy(() => Promise.resolve(endValue), {
      get(_, prop) {
        if (prop === 'then') return (resolve: Function) => resolve(endValue);
        if (prop === 'catch') return () => Promise.resolve(endValue);
        return () => buildChain(endValue);
      },
      apply() {
        return Promise.resolve(endValue);
      },
    });
  };
  return buildChain(resolvedValue);
}

// Use vi.hoisted to ensure the mock is available before hoisting
const mockDb = vi.hoisted(() => {
  const defaultInsertReturn = Promise.resolve([{
    id: 1, name: 'Test Brand', logo: null, description: null,
    website: null, sortOrder: 0, status: true,
    createdAt: new Date(), updatedAt: new Date(),
  }]);

  const defaultUpdateReturn = Promise.resolve([{
    id: 1, name: 'Updated Brand', logo: 'new-logo.png', description: null,
    website: null, sortOrder: 0, status: true,
    createdAt: new Date(), updatedAt: new Date(),
  }]);

  const defaultDeleteReturn = Promise.resolve({ rowCount: 1 });

  return {
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => defaultInsertReturn),
      })),
    })),
    select: vi.fn(() => createChainMock([])),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => defaultUpdateReturn),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => defaultDeleteReturn),
    })),
  };
});

vi.mock('@/lib/db/db', () => ({
  db: mockDb,
}));

// Import after mocking
import { BrandService } from '@/lib/services/brand.service';

describe('BrandService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a brand', async () => {
      const brandData = {
        name: 'Test Brand',
        description: 'A test brand',
        website: 'https://test.com',
        sortOrder: 0,
        status: true,
      };

      const result = await BrandService.create(brandData);

      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Test Brand');
      expect(mockDb.insert).toHaveBeenCalledWith(brands);
    });
  });

  describe('findById', () => {
    it('should find a brand by id', async () => {
      const mockBrand = { id: 1, name: 'Test Brand', logo: 'logo.png', status: true, website: 'https://test.com' };
      mockDb.select.mockReturnValue(createChainMock([mockBrand]));

      const result = await BrandService.findById(1);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('name', 'Test Brand');
      expect(mockDb.select).toHaveBeenCalled();
    });

    it('should return null when brand not found', async () => {
      mockDb.select.mockReturnValue(createChainMock([]));

      const result = await BrandService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all brands with pagination', async () => {
      const mockBrands = Array.from({ length: 3 }, (_, i) => ({
        id: i + 1, name: `Brand ${i + 1}`, status: true,
      }));
      mockDb.select.mockReturnValue(createChainMock(mockBrands));

      const result = await BrandService.findAll({ page: 1, limit: 10 });

      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('name', 'Brand 1');
    });
  });

  describe('update', () => {
    it('should update a brand', async () => {
      const result = await BrandService.update(1, { name: 'Updated Brand', logo: 'new-logo.png' });

      expect(result).toHaveProperty('name', 'Updated Brand');
      expect(mockDb.update).toHaveBeenCalledWith(brands);
    });
  });

  describe('delete', () => {
    it('should delete a brand', async () => {
      const result = await BrandService.delete(1);

      expect(result).toBe(true);
      expect(mockDb.delete).toHaveBeenCalledWith(brands);
    });

    it('should return false when brand not found', async () => {
      mockDb.delete.mockReturnValue({
        where: vi.fn(() => Promise.resolve({ rowCount: 0 })),
      });

      const result = await BrandService.delete(999);

      expect(result).toBe(false);
    });
  });
});
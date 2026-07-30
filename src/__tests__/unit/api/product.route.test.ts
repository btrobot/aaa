import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

// ─── Mock ProductService ──────────────────────────────────────
const mockProductService = {
  create: vi.fn(),
  findById: vi.fn(),
  search: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getHotProducts: vi.fn(),
  getCount: vi.fn(),
};

vi.mock('@/lib/services/product.service', () => ({
  ProductService: mockProductService,
}));

// ─── Mock api-middleware（简化为 try/catch + getErrorResponse）──
vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
  const wrap = (handler: Function) =>
    async (req: NextRequest, ctx: Record<string, unknown>) => {
      try {
        return await handler(req, ctx);
      } catch (error) {
        return getErrorResponse(error);
      }
    };
  return {
    withAdmin: wrap,
    withMiddleware: wrap,
    withAuth: wrap,
    cacheResponse: (res: NextResponse) => res,
  };
});

// ─── 动态导入路由 ─────────────────────────────────────────────
const { GET: GET_LIST, POST } = await import('@/app/api/products/route');
const {
  GET: GET_BY_ID,
  PUT,
  DELETE: DELETE_BY_ID,
} = await import('@/app/api/products/[id]/route');

// ─── 工具函数 ─────────────────────────────────────────────────
function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body
      ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }
      : {}),
  });
}

// ============================================================

describe('Product API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── POST /api/products ────────────────────────────────────
  describe('POST /api/products', () => {
    it('SKU 已存在 → 422', async () => {
      mockProductService.create.mockRejectedValue(
        new BusinessRuleError('SKU "DUP-001" 已存在'),
      );
      const res = await POST(
        makeRequest('/api/products', 'POST', { sku: 'DUP-001', price: '99.99', descriptions: {} }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(422);
    });

    it('品牌不存在 → 422', async () => {
      mockProductService.create.mockRejectedValue(
        new BusinessRuleError('品牌不存在 (id=999)'),
      );
      const res = await POST(
        makeRequest('/api/products', 'POST', { sku: 'NEW', price: '10.00', brandId: 999, descriptions: {} }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(422);
    });

    it('分类不存在 → 422', async () => {
      mockProductService.create.mockRejectedValue(
        new BusinessRuleError('分类不存在 (id=888)'),
      );
      const res = await POST(
        makeRequest('/api/products', 'POST', { sku: 'NEW', price: '10.00', categoryIds: [888], descriptions: {} }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(422);
    });

    it('正常创建 → 201', async () => {
      mockProductService.create.mockResolvedValue({ id: 1 });
      const res = await POST(
        makeRequest('/api/products', 'POST', { sku: 'NEW-001', price: '10.00', descriptions: {} }),
        { params: Promise.resolve({}) },
      );
      expect(res.status).toBe(201);
    });
  });

  // ─── GET /api/products/[id] ───────────────────────────────
  describe('GET /api/products/[id]', () => {
    it('产品不存在 → 404', async () => {
      mockProductService.findById.mockRejectedValue(new NotFoundError('产品', 999));
      const res = await GET_BY_ID(
        makeRequest('/api/products/999'),
        { params: Promise.resolve({ id: '999' }) },
      );
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockProductService.findById.mockResolvedValue({
        id: 1, sku: 'SKU-001', price: '99.99',
        descriptions: [], images: [], categoryIds: [], brand: null,
      });
      const res = await GET_BY_ID(
        makeRequest('/api/products/1'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(200);
    });
  });

  // ─── PUT /api/products/[id] ───────────────────────────────
  describe('PUT /api/products/[id]', () => {
    it('产品不存在 → 404', async () => {
      mockProductService.update.mockRejectedValue(new NotFoundError('产品', 999));
      const res = await PUT(
        makeRequest('/api/products/999', 'PUT', { price: '100.00' }),
        { params: Promise.resolve({ id: '999' }) },
      );
      expect(res.status).toBe(404);
    });

    it('正常更新 → 200', async () => {
      mockProductService.update.mockResolvedValue({ id: 1 });
      const res = await PUT(
        makeRequest('/api/products/1', 'PUT', { price: '88.00' }),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(200);
    });
  });

  // ─── DELETE /api/products/[id] ────────────────────────────
  describe('DELETE /api/products/[id]', () => {
    it('产品不存在 → 404', async () => {
      mockProductService.delete.mockRejectedValue(new NotFoundError('产品', 999));
      const res = await DELETE_BY_ID(
        makeRequest('/api/products/999', 'DELETE'),
        { params: Promise.resolve({ id: '999' }) },
      );
      expect(res.status).toBe(404);
    });

    it('有关联订单 → 422', async () => {
      mockProductService.delete.mockRejectedValue(
        new BusinessRuleError('该产品有关联订单，无法删除'),
      );
      const res = await DELETE_BY_ID(
        makeRequest('/api/products/1', 'DELETE'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(422);
    });

    it('正常删除 → 200', async () => {
      mockProductService.delete.mockResolvedValue(true);
      const res = await DELETE_BY_ID(
        makeRequest('/api/products/1', 'DELETE'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(200);
    });

    it('未知错误 → 500', async () => {
      mockProductService.delete.mockRejectedValue(new Error('数据库连接失败'));
      const res = await DELETE_BY_ID(
        makeRequest('/api/products/1', 'DELETE'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(500);
    });
  });
});

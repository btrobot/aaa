import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockBrandService = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/services/brand.service', () => ({ BrandService: mockBrandService }));

vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
  return {
    withAdmin: (handler: Function) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    withMiddleware: (handler: Function) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    withAuth: (handler: Function) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    cacheResponse: (res: NextResponse) => res,
  };
});

const { GET: GET_LIST, POST } = await import('@/app/api/brands/route');
const { GET: GET_BY_ID, PUT, DELETE: DELETE_BY_ID } = await import('@/app/api/brands/[id]/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('Brand API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('POST /api/brands', () => {
    it('品牌名已存在 → 422', async () => {
      mockBrandService.create.mockRejectedValue(new BusinessRuleError('品牌名已存在'));
      const res = await POST(makeRequest('/api/brands', 'POST', { name: 'Dup' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('正常创建 → 201', async () => {
      mockBrandService.create.mockResolvedValue({ id: 1, name: 'New' });
      const res = await POST(makeRequest('/api/brands', 'POST', { name: 'New' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/brands/[id]', () => {
    it('品牌不存在 → 404', async () => {
      mockBrandService.findById.mockRejectedValue(new NotFoundError('品牌', 999));
      const res = await GET_BY_ID(makeRequest('/api/brands/999'), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockBrandService.findById.mockResolvedValue({ id: 1, name: 'Brand' });
      const res = await GET_BY_ID(makeRequest('/api/brands/1'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/brands/[id]', () => {
    it('品牌不存在 → 404', async () => {
      mockBrandService.update.mockRejectedValue(new NotFoundError('品牌', 999));
      const res = await PUT(makeRequest('/api/brands/999', 'PUT', { name: 'X' }), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('正常更新 → 200', async () => {
      mockBrandService.update.mockResolvedValue({ id: 1, name: 'Updated' });
      const res = await PUT(makeRequest('/api/brands/1', 'PUT', { name: 'Updated' }), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/brands/[id]', () => {
    it('品牌不存在 → 404', async () => {
      mockBrandService.delete.mockRejectedValue(new NotFoundError('品牌', 999));
      const res = await DELETE_BY_ID(makeRequest('/api/brands/999', 'DELETE'), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('品牌有关联产品 → 422', async () => {
      mockBrandService.delete.mockRejectedValue(new BusinessRuleError('该品牌下仍有产品'));
      const res = await DELETE_BY_ID(makeRequest('/api/brands/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(422);
    });

    it('正常删除 → 200', async () => {
      mockBrandService.delete.mockResolvedValue(true);
      const res = await DELETE_BY_ID(makeRequest('/api/brands/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });

    it('未知错误 → 500', async () => {
      mockBrandService.delete.mockRejectedValue(new Error('boom'));
      const res = await DELETE_BY_ID(makeRequest('/api/brands/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(500);
    });
  });
});

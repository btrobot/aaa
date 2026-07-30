import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockCategoryService = {
  create: vi.fn(),
  getTree: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/services/category.service', () => ({ CategoryService: mockCategoryService }));

vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
  const wrap = (handler: Function) => async (req: NextRequest, ctx: Record<string, unknown>) => {
    try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
  };
  return { withAdmin: wrap, withMiddleware: wrap, withAuth: wrap, cacheResponse: (res: NextResponse) => res };
});

const { GET: GET_LIST, POST } = await import('@/app/api/categories/route');
const { GET: GET_BY_ID, PUT, DELETE: DELETE_BY_ID } = await import('@/app/api/categories/[id]/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('Category API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('POST /api/categories', () => {
    it('slug 已存在 → 422', async () => {
      mockCategoryService.create.mockRejectedValue(new BusinessRuleError('slug 已存在'));
      const res = await POST(makeRequest('/api/categories', 'POST', { slug: 'dup' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('正常创建 → 201', async () => {
      mockCategoryService.create.mockResolvedValue({ id: 1 });
      const res = await POST(makeRequest('/api/categories', 'POST', { slug: 'new' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/categories/[id]', () => {
    it('分类不存在 → 404', async () => {
      mockCategoryService.findById.mockRejectedValue(new NotFoundError('分类', 999));
      const res = await GET_BY_ID(makeRequest('/api/categories/999'), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockCategoryService.findById.mockResolvedValue({ categories: { id: 1 }, category_descriptions: { name: 'A' } });
      const res = await GET_BY_ID(makeRequest('/api/categories/1'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/categories/[id]', () => {
    it('分类不存在 → 404', async () => {
      mockCategoryService.update.mockRejectedValue(new NotFoundError('分类', 999));
      const res = await PUT(makeRequest('/api/categories/999', 'PUT', { slug: 'x' }), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('循环引用 → 422', async () => {
      mockCategoryService.update.mockRejectedValue(new BusinessRuleError('父分类不能指向自身'));
      const res = await PUT(makeRequest('/api/categories/1', 'PUT', { parentId: 1 }), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(422);
    });

    it('正常更新 → 200', async () => {
      mockCategoryService.update.mockResolvedValue({ id: 1 });
      const res = await PUT(makeRequest('/api/categories/1', 'PUT', { slug: 'new' }), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/categories/[id]', () => {
    it('分类不存在 → 404', async () => {
      mockCategoryService.delete.mockRejectedValue(new NotFoundError('分类', 999));
      const res = await DELETE_BY_ID(makeRequest('/api/categories/999', 'DELETE'), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('有子分类 → 422', async () => {
      mockCategoryService.delete.mockRejectedValue(new BusinessRuleError('该分类下有子分类'));
      const res = await DELETE_BY_ID(makeRequest('/api/categories/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(422);
    });

    it('有关联产品 → 422', async () => {
      mockCategoryService.delete.mockRejectedValue(new BusinessRuleError('该分类下有产品'));
      const res = await DELETE_BY_ID(makeRequest('/api/categories/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(422);
    });

    it('正常删除 → 200', async () => {
      mockCategoryService.delete.mockResolvedValue(true);
      const res = await DELETE_BY_ID(makeRequest('/api/categories/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });
});

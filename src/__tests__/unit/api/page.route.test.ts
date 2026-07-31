import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockPageService = {
  search: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock('@/lib/services/page.service', () => ({
  PageService: function () { return mockPageService; },
  pageService: mockPageService,
}));

vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
  return {
    withAdmin: (handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    withMiddleware: (handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    withAuth: (handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    cacheResponse: (res: NextResponse) => res,
  };
});

const { GET: GET_LIST, POST } = await import('@/app/api/v1/pages/route');
const { GET: GET_BY_ID, PUT, DELETE: DELETE_BY_ID } = await import('@/app/api/v1/pages/[id]/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('Page API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // GET /api/pages
  // ===========================================================================
  describe('GET /api/pages', () => {
    it('正常列表 → 200', async () => {
      mockPageService.search.mockResolvedValue([]);
      const res = await GET_LIST(makeRequest('/api/pages'), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(200);
    });
  });

  // ===========================================================================
  // POST /api/pages
  // ===========================================================================
  describe('POST /api/pages', () => {
    it('slug 重复 → 422', async () => {
      mockPageService.create.mockRejectedValue(new BusinessRuleError('slug "dup" 已存在'));
      const res = await POST(makeRequest('/api/pages', 'POST', { slug: 'dup' }), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(422);
    });

    it('正常创建 → 201', async () => {
      mockPageService.create.mockResolvedValue({ id: 1, slug: 'new' });
      const res = await POST(makeRequest('/api/pages', 'POST', { slug: 'new' }), { params: Promise.resolve<Record<string, string>>({}) });
      expect(res.status).toBe(201);
    });
  });

  // ===========================================================================
  // GET /api/pages/[id]
  // ===========================================================================
  describe('GET /api/pages/[id]', () => {
    it('页面不存在 → 404', async () => {
      mockPageService.getById.mockRejectedValue(new NotFoundError('文章', 999));
      const res = await GET_BY_ID(makeRequest('/api/pages/999'), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockPageService.getById.mockResolvedValue({ id: 1, title: '页面' });
      const res = await GET_BY_ID(makeRequest('/api/pages/1'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });

  // ===========================================================================
  // PUT /api/pages/[id]
  // ===========================================================================
  describe('PUT /api/pages/[id]', () => {
    it('页面不存在 → 404', async () => {
      mockPageService.update.mockRejectedValue(new NotFoundError('文章', 999));
      const res = await PUT(makeRequest('/api/pages/999', 'PUT', { slug: 'x' }), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('正常更新 → 200', async () => {
      mockPageService.update.mockResolvedValue({ id: 1, slug: 'updated' });
      const res = await PUT(makeRequest('/api/pages/1', 'PUT', { slug: 'updated' }), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });

  // ===========================================================================
  // DELETE /api/pages/[id]
  // ===========================================================================
  describe('DELETE /api/pages/[id]', () => {
    it('页面不存在 → 404', async () => {
      mockPageService.delete.mockRejectedValue(new NotFoundError('文章', 999));
      const res = await DELETE_BY_ID(makeRequest('/api/pages/999', 'DELETE'), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('正常删除 → 200', async () => {
      mockPageService.delete.mockResolvedValue(true);
      const res = await DELETE_BY_ID(makeRequest('/api/pages/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });

    it('未知错误 → 500', async () => {
      mockPageService.delete.mockRejectedValue(new Error('boom'));
      const res = await DELETE_BY_ID(makeRequest('/api/pages/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(500);
    });
  });
});

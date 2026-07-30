import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

// ── Service Mock ───────────────────────────────────────────────
const mockService = {
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

// 使用 class mock 让 new CustomerGroupService() 正常工作
vi.mock('@/lib/services/customer-group.service', () => {
  return {
    CustomerGroupService: class {
      list = mockService.list;
      getById = mockService.getById;
      create = mockService.create;
      update = mockService.update;
      delete = mockService.delete;
    },
  };
});

// ── Middleware Mock（透传 handler + 错误捕获）────────────────────
vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
  const wrap = (handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse>) =>
    async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    };
  return { withAdmin: wrap, withMiddleware: wrap, withAuth: wrap, cacheResponse: (res: NextResponse) => res };
});

// ── 动态导入路由 ───────────────────────────────────────────────
const { GET: GET_LIST, POST } = await import('@/app/api/customer-groups/route');
const { PUT, DELETE: DELETE_BY_ID } = await import('@/app/api/customer-groups/[id]/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('CustomerGroup API Route — ServiceError → HTTP 状态码映射', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // GET /api/customer-groups
  // ===========================================================================
  describe('GET /api/customer-groups', () => {
    it('正常查询 → 200', async () => {
      mockService.list.mockResolvedValue({ items: [{ id: 1, name: 'VIP' }] });
      const res = await GET_LIST(makeRequest('/api/customer-groups'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('空列表 → 200', async () => {
      mockService.list.mockResolvedValue({ items: [] });
      const res = await GET_LIST(makeRequest('/api/customer-groups'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });
  });

  // ===========================================================================
  // POST /api/customer-groups
  // ===========================================================================
  describe('POST /api/customer-groups', () => {
    it('正常创建 → 201', async () => {
      mockService.create.mockResolvedValue({ id: 1, name: 'VIP' });
      const res = await POST(makeRequest('/api/customer-groups', 'POST', { name: 'VIP' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });

    it('分组名已存在 → 422', async () => {
      mockService.create.mockRejectedValue(new BusinessRuleError('客户分组名已存在'));
      const res = await POST(makeRequest('/api/customer-groups', 'POST', { name: 'VIP' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('折扣率超出范围 → 422', async () => {
      mockService.create.mockRejectedValue(new BusinessRuleError('折扣率必须在 0-100 之间'));
      const res = await POST(makeRequest('/api/customer-groups', 'POST', { name: 'X', discount: '150' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });
  });

  // ===========================================================================
  // PUT /api/customer-groups/[id]
  // ===========================================================================
  describe('PUT /api/customer-groups/[id]', () => {
    it('正常更新 → 200', async () => {
      mockService.update.mockResolvedValue({ id: 1, name: '更新后' });
      const res = await PUT(makeRequest('/api/customer-groups/1', 'PUT', { name: '更新后' }), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });

    it('分组不存在 → 404', async () => {
      mockService.update.mockRejectedValue(new NotFoundError('客户分组', 999));
      const res = await PUT(makeRequest('/api/customer-groups/999', 'PUT', { name: 'X' }), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('折扣率超出范围 → 422', async () => {
      mockService.update.mockRejectedValue(new BusinessRuleError('折扣率必须在 0-100 之间'));
      const res = await PUT(makeRequest('/api/customer-groups/1', 'PUT', { discount: '200' }), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(422);
    });
  });

  // ===========================================================================
  // DELETE /api/customer-groups/[id]
  // ===========================================================================
  describe('DELETE /api/customer-groups/[id]', () => {
    it('正常删除 → 200', async () => {
      mockService.delete.mockResolvedValue(true);
      const res = await DELETE_BY_ID(makeRequest('/api/customer-groups/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });

    it('分组不存在 → 404', async () => {
      mockService.delete.mockRejectedValue(new NotFoundError('客户分组', 999));
      const res = await DELETE_BY_ID(makeRequest('/api/customer-groups/999', 'DELETE'), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('有关联客户 → 422', async () => {
      mockService.delete.mockRejectedValue(new BusinessRuleError('该分组下存在客户，无法删除'));
      const res = await DELETE_BY_ID(makeRequest('/api/customer-groups/1', 'DELETE'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(422);
    });
  });
});

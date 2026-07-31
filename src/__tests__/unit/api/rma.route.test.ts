import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockRmaService = {
  create: vi.fn(),
  findById: vi.fn(),
  getByCustomerId: vi.fn(),
  getAll: vi.fn(),
  updateStatus: vi.fn(),
  getNextStatuses: vi.fn(),
};

vi.mock('@/lib/services/rma.service', () => ({ RmaService: mockRmaService }));

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
  };
});

const { GET: _GET_LIST, POST } = await import('@/app/api/rmas/route');
const { GET: GET_BY_ID, PUT } = await import('@/app/api/rmas/[id]/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('RMA API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // POST /api/rmas
  // ===========================================================================
  describe('POST /api/rmas', () => {
    it('订单产品不存在 → 404', async () => {
      mockRmaService.create.mockRejectedValue(new NotFoundError('订单产品', 999));
      const res = await POST(
        makeRequest('/api/rmas', 'POST', { orderProductId: 999 }),
        { params: Promise.resolve({}), user: { id: 1, role: 'customer' } }
      );
      expect(res.status).toBe(404);
    });

    it('订单未完成 → 422', async () => {
      mockRmaService.create.mockRejectedValue(new BusinessRuleError('订单状态必须为已完成才能申请退换货'));
      const res = await POST(
        makeRequest('/api/rmas', 'POST', { orderProductId: 10 }),
        { params: Promise.resolve({}), user: { id: 1, role: 'customer' } }
      );
      expect(res.status).toBe(422);
    });

    it('正常创建 → 201', async () => {
      mockRmaService.create.mockResolvedValue({ id: 1, status: 'pending' });
      const res = await POST(
        makeRequest('/api/rmas', 'POST', { orderProductId: 10, type: 'refund', reason: '质量问题' }),
        { params: Promise.resolve({}), user: { id: 1, role: 'customer' } }
      );
      expect(res.status).toBe(201);
    });
  });

  // ===========================================================================
  // GET /api/rmas/[id]
  // ===========================================================================
  describe('GET /api/rmas/[id]', () => {
    it('退换货单不存在 → 404', async () => {
      mockRmaService.findById.mockRejectedValue(new NotFoundError('退换货单', 999));
      const res = await GET_BY_ID(
        makeRequest('/api/rmas/999'),
        { params: Promise.resolve({ id: '999' }), user: { id: 1, role: 'admin' } }
      );
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockRmaService.findById.mockResolvedValue({ id: 1, customerId: 100, status: 'pending' });
      const res = await GET_BY_ID(
        makeRequest('/api/rmas/1'),
        { params: Promise.resolve({ id: '1' }), user: { id: 1, role: 'admin' } }
      );
      expect(res.status).toBe(200);
    });

    it('非管理员查看他人退换货 → 403', async () => {
      mockRmaService.findById.mockResolvedValue({ id: 1, customerId: 200, status: 'pending' });
      const res = await GET_BY_ID(
        makeRequest('/api/rmas/1'),
        { params: Promise.resolve({ id: '1' }), user: { id: 1, role: 'customer' } }
      );
      expect(res.status).toBe(403);
    });
  });

  // ===========================================================================
  // PUT /api/rmas/[id]
  // ===========================================================================
  describe('PUT /api/rmas/[id]', () => {
    it('退换货单不存在 → 404', async () => {
      mockRmaService.updateStatus.mockRejectedValue(new NotFoundError('退换货单', 999));
      const res = await PUT(
        makeRequest('/api/rmas/999', 'PUT', { status: 'approved' }),
        { params: Promise.resolve({ id: '999' }) }
      );
      expect(res.status).toBe(404);
    });

    it('非法状态转换 → 422', async () => {
      mockRmaService.updateStatus.mockRejectedValue(new BusinessRuleError('不允许从「pending」转换为「completed」'));
      const res = await PUT(
        makeRequest('/api/rmas/1', 'PUT', { status: 'completed' }),
        { params: Promise.resolve({ id: '1' }) }
      );
      expect(res.status).toBe(422);
    });

    it('拒绝时未填写 adminNote → 422', async () => {
      mockRmaService.updateStatus.mockRejectedValue(new BusinessRuleError('拒绝退换货时必须填写管理员备注'));
      const res = await PUT(
        makeRequest('/api/rmas/1', 'PUT', { status: 'rejected' }),
        { params: Promise.resolve({ id: '1' }) }
      );
      expect(res.status).toBe(422);
    });

    it('正常更新状态 → 200', async () => {
      mockRmaService.updateStatus.mockResolvedValue({ id: 1, status: 'approved' });
      const res = await PUT(
        makeRequest('/api/rmas/1', 'PUT', { status: 'approved' }),
        { params: Promise.resolve({ id: '1' }) }
      );
      expect(res.status).toBe(200);
    });

    it('未知错误 → 500', async () => {
      mockRmaService.updateStatus.mockRejectedValue(new Error('boom'));
      const res = await PUT(
        makeRequest('/api/rmas/1', 'PUT', { status: 'approved' }),
        { params: Promise.resolve({ id: '1' }) }
      );
      expect(res.status).toBe(500);
    });
  });
});

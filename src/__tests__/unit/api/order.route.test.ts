import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockOrderService = {
  create: vi.fn(),
  getById: vi.fn(),
  findByNumber: vi.fn(),
  getAll: vi.fn(),
  getCustomerOrders: vi.fn(),
  updateStatus: vi.fn(),
  cancel: vi.fn(),
  getNextStatuses: vi.fn(),
};

vi.mock('@/lib/services/order.service', () => ({ OrderService: mockOrderService }));

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
      try { return await handler(req, { ...ctx, user: { id: 1, role: 'admin' } }); } catch (error) { return getErrorResponse(error); }
    },
    withAuth: (handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse> | NextResponse) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try { return await handler(req, { ...ctx, user: { id: 1, role: 'customer' } }); } catch (error) { return getErrorResponse(error); }
    },
    cacheResponse: (res: NextResponse) => res,
  };
});

const { GET: GET_LIST, POST } = await import('@/app/api/v1/orders/route');
const { GET: GET_BY_ID, PUT: PUT_BY_ID } = await import('@/app/api/v1/orders/[id]/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('Order API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ═══ POST /api/orders ═══════════════════════════════════════════

  describe('POST /api/orders', () => {
    it('购物车为空 → 422', async () => {
      mockOrderService.create.mockRejectedValue(new BusinessRuleError('购物车为空'));
      const res = await POST(makeRequest('/api/orders', 'POST', { customerId: 1 }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.code).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('正常创建 → 201', async () => {
      mockOrderService.create.mockResolvedValue({ id: 1, number: 'ORD-TEST-001', status: 'pending' });
      const res = await POST(makeRequest('/api/orders', 'POST', { customerId: 1 }), { params: Promise.resolve({}) });
      expect(res.status).toBe(201);
    });

    it('未知错误 → 500', async () => {
      mockOrderService.create.mockRejectedValue(new Error('boom'));
      const res = await POST(makeRequest('/api/orders', 'POST', { customerId: 1 }), { params: Promise.resolve({}) });
      expect(res.status).toBe(500);
    });
  });

  // ═══ GET /api/orders/[id] ═══════════════════════════════════════

  describe('GET /api/orders/[id]', () => {
    it('订单不存在 → 404', async () => {
      mockOrderService.getById.mockRejectedValue(new NotFoundError('订单', 999));
      const res = await GET_BY_ID(makeRequest('/api/orders/999'), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockOrderService.getById.mockResolvedValue({ id: 1, customerId: 1, status: 'pending', items: [] });
      const res = await GET_BY_ID(makeRequest('/api/orders/1'), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });

  // ═══ GET /api/orders (findByNumber) ═════════════════════════════

  describe('GET /api/orders?number=xxx', () => {
    it('订单号不存在 → 404', async () => {
      mockOrderService.findByNumber.mockRejectedValue(new NotFoundError('订单', 'ORD-NONE'));
      const res = await GET_LIST(makeRequest('/api/orders?number=ORD-NONE'), { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockOrderService.findByNumber.mockResolvedValue({ orders: { id: 1, number: 'ORD-001' } });
      const res = await GET_LIST(makeRequest('/api/orders?number=ORD-001'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });
  });

  // ═══ PUT /api/orders/[id] (updateStatus) ═══════════════════════

  describe('PUT /api/orders/[id]', () => {
    it('订单不存在 → 404', async () => {
      mockOrderService.updateStatus.mockRejectedValue(new NotFoundError('订单', 999));
      const res = await PUT_BY_ID(makeRequest('/api/orders/999', 'PUT', { status: 'confirmed' }), { params: Promise.resolve({ id: '999' }) });
      expect(res.status).toBe(404);
    });

    it('非法状态转换 → 422', async () => {
      mockOrderService.updateStatus.mockRejectedValue(new BusinessRuleError('无法从 pending 转换到 shipped'));
      const res = await PUT_BY_ID(makeRequest('/api/orders/1', 'PUT', { status: 'shipped' }), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(422);
    });

    it('正常更新 → 200', async () => {
      mockOrderService.updateStatus.mockResolvedValue({ id: 1, status: 'confirmed' });
      const res = await PUT_BY_ID(makeRequest('/api/orders/1', 'PUT', { status: 'confirmed' }), { params: Promise.resolve({ id: '1' }) });
      expect(res.status).toBe(200);
    });
  });
});

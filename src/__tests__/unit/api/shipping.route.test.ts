import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockShippingService = {
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  calculateFee: vi.fn(),
  updateOrderShipping: vi.fn(),
};

vi.mock('@/lib/services/shipping.service', () => ({
  ShippingService: mockShippingService,
}));

vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
  return {
    withAdmin: (handler: Function) => async (req: NextRequest, ctx?: unknown) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    withMiddleware: (handler: Function) => async (req: NextRequest, ctx?: unknown) => {
      try { return await handler(req, ctx); } catch (error) { return getErrorResponse(error); }
    },
    cacheResponse: (res: NextResponse) => res,
  };
});

const { GET, POST } = await import('@/app/api/shipping-methods/route');
const { PUT, DELETE } = await import('@/app/api/shipping-methods/[id]/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

describe('Shipping API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ===========================================================================
  // GET /api/shipping-methods
  // ===========================================================================
  describe('GET /api/shipping-methods', () => {
    it('正常获取配送方式列表 → 200', async () => {
      mockShippingService.list.mockResolvedValue([{ id: 1, code: 'express', name: '快递' }]);
      const res = await GET(makeRequest('/api/shipping-methods'));
      expect(res.status).toBe(200);
    });
  });

  // ===========================================================================
  // POST /api/shipping-methods
  // ===========================================================================
  describe('POST /api/shipping-methods', () => {
    it('正常创建配送方式 → 201', async () => {
      mockShippingService.create.mockResolvedValue({ id: 1, code: 'express' });
      const res = await POST(makeRequest('/api/shipping-methods', 'POST', {
        code: 'express', baseFee: '10.00', descriptions: { zh_cn: { name: '快递' } },
      }));
      expect(res.status).toBe(201);
    });

    it('code 已存在 → 422', async () => {
      mockShippingService.create.mockRejectedValue(new BusinessRuleError('配送方式代码已存在'));
      const res = await POST(makeRequest('/api/shipping-methods', 'POST', {
        code: 'express', baseFee: '10.00', descriptions: { zh_cn: { name: '快递' } },
      }));
      expect(res.status).toBe(422);
    });
  });

  // ===========================================================================
  // PUT /api/shipping-methods/:id
  // ===========================================================================
  describe('PUT /api/shipping-methods/:id', () => {
    it('正常更新配送方式 → 200', async () => {
      mockShippingService.update.mockResolvedValue([{ id: 1, code: 'express' }]);
      const res = await PUT(
        makeRequest('/api/shipping-methods/1', 'PUT', { baseFee: '15.00' }),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(200);
    });

    it('配送方式不存在 → 404', async () => {
      mockShippingService.update.mockRejectedValue(new NotFoundError('配送方式', 999));
      const res = await PUT(
        makeRequest('/api/shipping-methods/999', 'PUT', { baseFee: '15.00' }),
        { params: Promise.resolve({ id: '999' }) },
      );
      expect(res.status).toBe(404);
    });
  });

  // ===========================================================================
  // DELETE /api/shipping-methods/:id
  // ===========================================================================
  describe('DELETE /api/shipping-methods/:id', () => {
    it('正常删除配送方式 → 200', async () => {
      mockShippingService.delete.mockResolvedValue(undefined);
      const res = await DELETE(
        makeRequest('/api/shipping-methods/1', 'DELETE'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(200);
    });

    it('配送方式不存在 → 404', async () => {
      mockShippingService.delete.mockRejectedValue(new NotFoundError('配送方式', 999));
      const res = await DELETE(
        makeRequest('/api/shipping-methods/999', 'DELETE'),
        { params: Promise.resolve({ id: '999' }) },
      );
      expect(res.status).toBe(404);
    });

    it('有关联订单 → 422', async () => {
      mockShippingService.delete.mockRejectedValue(new BusinessRuleError('有关联订单的配送方式不可删除'));
      const res = await DELETE(
        makeRequest('/api/shipping-methods/1', 'DELETE'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(422);
    });

    it('未捕获错误 → 500', async () => {
      mockShippingService.delete.mockRejectedValue(new Error('未知错误'));
      const res = await DELETE(
        makeRequest('/api/shipping-methods/1', 'DELETE'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(500);
    });
  });
});

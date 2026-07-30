import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockCartService = {
  addItem: vi.fn(),
  getCart: vi.fn(),
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
  clearCart: vi.fn(),
  toggleSelect: vi.fn(),
};

vi.mock('@/lib/services/cart.service', () => ({ CartService: mockCartService }));

// Mock withAuth to wrap handler with try/catch (mimics real middleware)
vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }

  return {
    withAuth: (handler: Function) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try {
        return await handler(req, ctx);
      } catch (error) {
        return getErrorResponse(error);
      }
    },
  };
});

const fakeUser = { id: 1, email: 'test@test.com', role: 'customer' as const };

// Import route handlers AFTER mocks
const { POST, PUT, DELETE } = await import('@/app/api/cart/route');

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } } : {}),
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('Cart API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('POST /api/cart', () => {
    it('产品不存在 → 404', async () => {
      mockCartService.addItem.mockRejectedValue(new NotFoundError('产品', 999));
      const res = await POST(makeRequest('/api/cart', 'POST', { productId: 999, quantity: 1 }), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(404);
      const json = await res.json();
      expect(json.code).toBe('NOT_FOUND');
    });

    it('产品已下架 → 422', async () => {
      mockCartService.addItem.mockRejectedValue(new BusinessRuleError('产品已下架'));
      const res = await POST(makeRequest('/api/cart', 'POST', { productId: 1, quantity: 1 }), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(422);
      const json = await res.json();
      expect(json.code).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('库存不足 → 422', async () => {
      mockCartService.addItem.mockRejectedValue(new BusinessRuleError('库存不足'));
      const res = await POST(makeRequest('/api/cart', 'POST', { productId: 1, quantity: 100 }), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(422);
    });

    it('正常添加 → 201', async () => {
      mockCartService.addItem.mockResolvedValue({ id: 1, quantity: 2 });
      const res = await POST(makeRequest('/api/cart', 'POST', { productId: 1, quantity: 2 }), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/cart', () => {
    it('购物车项不存在 → 404', async () => {
      mockCartService.updateQuantity.mockRejectedValue(new NotFoundError('购物车项', 999));
      const res = await PUT(makeRequest('/api/cart', 'PUT', { id: 999, quantity: 5 }), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(404);
    });

    it('数量超限 → 422', async () => {
      mockCartService.updateQuantity.mockRejectedValue(new BusinessRuleError('数量必须在 1-99 之间'));
      const res = await PUT(makeRequest('/api/cart', 'PUT', { id: 1, quantity: 100 }), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(422);
    });

    it('正常更新 → 200', async () => {
      mockCartService.updateQuantity.mockResolvedValue({ id: 1, quantity: 5 });
      const res = await PUT(makeRequest('/api/cart', 'PUT', { id: 1, quantity: 5 }), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/cart', () => {
    it('购物车项不存在 → 404', async () => {
      mockCartService.removeItem.mockRejectedValue(new NotFoundError('购物车项', 999));
      const res = await DELETE(makeRequest('/api/cart?id=999', 'DELETE'), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(404);
    });

    it('正常删除 → 200', async () => {
      mockCartService.removeItem.mockResolvedValue(true);
      const res = await DELETE(makeRequest('/api/cart?id=1', 'DELETE'), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(200);
    });
  });

  describe('未知错误 → 500', () => {
    it('非 ServiceError 应返回 500', async () => {
      mockCartService.addItem.mockRejectedValue(new Error('boom'));
      const res = await POST(makeRequest('/api/cart', 'POST', { productId: 1, quantity: 1 }), { params: Promise.resolve({}), user: fakeUser });
      expect(res.status).toBe(500);
      const json = await res.json();
      expect(json.error).toBe('服务器内部错误');
    });
  });
});

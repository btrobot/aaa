import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

// ─── Mock CustomerService ─────────────────────────────────────

const mockCustomerService = {
  register: vi.fn(),
  login: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn(),
  updateProfile: vi.fn(),
  addAddress: vi.fn(),
  getAddresses: vi.fn(),
  deleteAddress: vi.fn(),
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  getWishlist: vi.fn(),
};

vi.mock('@/lib/services/customer.service', () => ({
  CustomerService: mockCustomerService,
}));

// ─── Mock api-middleware ──────────────────────────────────────

vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status }
      );
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }

  return {
    withAdmin:
      (handler: Function) =>
      async (req: NextRequest, ctx: Record<string, unknown>) => {
        try {
          return await handler(req, ctx);
        } catch (error) {
          return getErrorResponse(error);
        }
      },
    withMiddleware:
      (handler: Function) =>
      async (req: NextRequest, ctx: Record<string, unknown>) => {
        try {
          return await handler(req, ctx);
        } catch (error) {
          return getErrorResponse(error);
        }
      },
    withAuth:
      (handler: Function) =>
      async (req: NextRequest, ctx: Record<string, unknown>) => {
        try {
          return await handler(req, ctx);
        } catch (error) {
          return getErrorResponse(error);
        }
      },
    withRateLimit:
      (handler: Function) =>
      async (req: NextRequest, ctx: Record<string, unknown>) => {
        try {
          return await handler(req, ctx);
        } catch (error) {
          return getErrorResponse(error);
        }
      },
    cacheResponse: (res: NextResponse) => res,
  };
});

// ─── Import routes after mocks ────────────────────────────────

const { GET: GET_CUSTOMERS, POST: POST_CUSTOMER } = await import(
  '@/app/api/customers/route'
);
const {
  GET: GET_WISHLIST,
  POST: POST_WISHLIST,
  DELETE: DELETE_WISHLIST,
} = await import('@/app/api/customers/wishlist/route');

// ─── Helpers ──────────────────────────────────────────────────

function makeRequest(url: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost:9090'), {
    method,
    ...(body
      ? { body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }
      : {}),
  });
}

const adminCtx = { user: { id: 1, email: 'admin@test.com', role: 'admin' } };
// 使用管理员上下文避免权限检查拦截（路由内权限检查在 findById 之前执行）
const customerCtx = { user: { id: 999, email: 'user@test.com', role: 'customer' } };

// ─── 测试 ─────────────────────────────────────────────────────

describe('Customer API 路由 — ServiceError → HTTP 状态码映射', () => {
  beforeEach(() => vi.clearAllMocks());

  // ======== GET /api/customers ========
  describe('GET /api/customers', () => {
    it('客户不存在 → 404', async () => {
      // 使用管理员避免权限拦截；admin=true 走 findAll 分支，所以用 id 匹配 user.id
      mockCustomerService.findById.mockRejectedValue(new NotFoundError('客户', 999));

      const res = await GET_CUSTOMERS(
        makeRequest('/api/customers?id=999'),
        { params: Promise.resolve({}), ...customerCtx }
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });

    it('管理员查看全部客户 → 200', async () => {
      mockCustomerService.findAll.mockResolvedValue([
        { id: 1, email: 'a@test.com' },
        { id: 2, email: 'b@test.com' },
      ]);

      const res = await GET_CUSTOMERS(
        makeRequest('/api/customers?admin=true'),
        { params: Promise.resolve({}), ...adminCtx }
      );

      expect(res.status).toBe(200);
    });

    it('正常查询自己 → 200', async () => {
      mockCustomerService.findById.mockResolvedValue({ id: 999, email: 'user@test.com' });

      const res = await GET_CUSTOMERS(
        makeRequest('/api/customers?id=999'),
        { params: Promise.resolve({}), ...customerCtx }
      );

      expect(res.status).toBe(200);
    });
  });

  // ======== POST /api/customers (管理员创建) ========
  describe('POST /api/customers', () => {
    it('邮箱已被注册 → 422', async () => {
      mockCustomerService.register.mockRejectedValue(
        new BusinessRuleError('邮箱已被注册')
      );

      const res = await POST_CUSTOMER(
        makeRequest('/api/customers', 'POST', {
          email: 'dup@test.com', password: '123456', name: 'Dup',
        }),
        { params: Promise.resolve({}) }
      );

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.code).toBe('BUSINESS_RULE_VIOLATION');
    });

    it('正常创建 → 201', async () => {
      mockCustomerService.register.mockResolvedValue({ id: 1, email: 'new@test.com' });

      const res = await POST_CUSTOMER(
        makeRequest('/api/customers', 'POST', {
          email: 'new@test.com', password: '123456', name: 'New',
        }),
        { params: Promise.resolve({}) }
      );

      expect(res.status).toBe(201);
    });
  });

  // ======== POST /api/customers/wishlist ========
  describe('POST /api/customers/wishlist', () => {
    it('产品不存在 → 404', async () => {
      mockCustomerService.addToWishlist.mockRejectedValue(
        new NotFoundError('产品', 999)
      );

      const res = await POST_WISHLIST(
        makeRequest('/api/customers/wishlist', 'POST', { productId: 999 }),
        { params: Promise.resolve({}), ...customerCtx }
      );

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.code).toBe('NOT_FOUND');
    });

    it('正常添加 → 201', async () => {
      mockCustomerService.addToWishlist.mockResolvedValue({
        customerId: 10, productId: 1, createdAt: new Date(),
      });

      const res = await POST_WISHLIST(
        makeRequest('/api/customers/wishlist', 'POST', { productId: 1 }),
        { params: Promise.resolve({}), ...customerCtx }
      );

      expect(res.status).toBe(201);
    });
  });

  // ======== DELETE /api/customers/wishlist ========
  describe('DELETE /api/customers/wishlist', () => {
    it('收藏记录不存在 → 404', async () => {
      mockCustomerService.removeFromWishlist.mockRejectedValue(
        new NotFoundError('收藏记录')
      );

      const res = await DELETE_WISHLIST(
        makeRequest('/api/customers/wishlist?productId=999', 'DELETE'),
        { params: Promise.resolve({}), ...customerCtx }
      );

      expect(res.status).toBe(404);
    });

    it('正常删除 → 200', async () => {
      mockCustomerService.removeFromWishlist.mockResolvedValue(true);

      const res = await DELETE_WISHLIST(
        makeRequest('/api/customers/wishlist?productId=1', 'DELETE'),
        { params: Promise.resolve({}), ...customerCtx }
      );

      expect(res.status).toBe(200);
    });
  });

  // ======== 未知错误 → 500 ========
  describe('未知错误处理', () => {
    it('非 ServiceError → 500', async () => {
      mockCustomerService.findById.mockRejectedValue(new Error('boom'));

      const res = await GET_CUSTOMERS(
        makeRequest('/api/customers?id=999'),
        { params: Promise.resolve({}), ...customerCtx }
      );

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('服务器内部错误');
    });
  });
});

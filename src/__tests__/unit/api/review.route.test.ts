import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

// ─── Mock ReviewService ──────────────────────────────────────
const mockReviewService = {
  create: vi.fn(),
  findById: vi.fn(),
  getByProductId: vi.fn(),
  list: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getStats: vi.fn(),
};

vi.mock('@/lib/services/review.service', () => ({
  ReviewService: mockReviewService,
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
  const wrap = (handler: (req: NextRequest, ctx: Record<string, unknown>) => Promise<NextResponse>) =>
    async (req: NextRequest, ctx: Record<string, unknown>) => {
      try {
        return await handler(req, ctx);
      } catch (error) {
        return getErrorResponse(error);
      }
    };
  return {
    withRateLimit: wrap,
    withAuth: wrap,
    withAdmin: wrap,
    cacheResponse: (res: NextResponse) => res,
  };
});

// ─── 动态导入路由 ─────────────────────────────────────────────
const { GET: _GET_LIST, POST } = await import('@/app/api/v1/reviews/route');
const {
  GET: GET_BY_ID,
  PUT,
  DELETE: DELETE_BY_ID,
} = await import('@/app/api/v1/reviews/[id]/route');
const { GET: GET_STATS } = await import('@/app/api/v1/reviews/stats/route');

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

describe('Review API Route — ServiceError 回归测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── POST /api/reviews ────────────────────────────────────
  describe('POST /api/reviews', () => {
    it('正常创建 → 201', async () => {
      mockReviewService.create.mockResolvedValue({
        id: 1, productId: 1, customerId: 1, rating: 5, content: '好评',
      });
      const res = await POST(
        makeRequest('/api/reviews', 'POST', { productId: 1, rating: 5, content: '好评' }),
        { params: Promise.resolve({}), user: { id: 1 } } as any,
      );
      expect(res.status).toBe(201);
    });

    it('产品不存在 → 404', async () => {
      mockReviewService.create.mockRejectedValue(new NotFoundError('产品', 999));
      const res = await POST(
        makeRequest('/api/reviews', 'POST', { productId: 999, rating: 5 }),
        { params: Promise.resolve({}), user: { id: 1 } } as any,
      );
      expect(res.status).toBe(404);
    });

    it('未购买该产品 → 422', async () => {
      mockReviewService.create.mockRejectedValue(
        new BusinessRuleError('只有已购买该产品的客户才能评价'),
      );
      const res = await POST(
        makeRequest('/api/reviews', 'POST', { productId: 1, rating: 5 }),
        { params: Promise.resolve({}), user: { id: 1 } } as any,
      );
      expect(res.status).toBe(422);
    });

    it('已评价过 → 422', async () => {
      mockReviewService.create.mockRejectedValue(
        new BusinessRuleError('您已经评价过该产品'),
      );
      const res = await POST(
        makeRequest('/api/reviews', 'POST', { productId: 1, rating: 5 }),
        { params: Promise.resolve({}), user: { id: 1 } } as any,
      );
      expect(res.status).toBe(422);
    });

    it('未知错误 → 500', async () => {
      mockReviewService.create.mockRejectedValue(new Error('数据库连接失败'));
      const res = await POST(
        makeRequest('/api/reviews', 'POST', { productId: 1, rating: 5 }),
        { params: Promise.resolve({}), user: { id: 1 } } as any,
      );
      expect(res.status).toBe(500);
    });
  });

  // ─── GET /api/reviews/[id] ───────────────────────────────
  describe('GET /api/reviews/[id]', () => {
    it('评价不存在 → 404', async () => {
      mockReviewService.findById.mockRejectedValue(new NotFoundError('评价', 999));
      const res = await GET_BY_ID(
        makeRequest('/api/reviews/999'),
        { params: Promise.resolve({ id: '999' }) },
      );
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockReviewService.findById.mockResolvedValue({
        id: 1, productId: 1, customerId: 1, rating: 5, content: '好评', customerName: '张三',
      });
      const res = await GET_BY_ID(
        makeRequest('/api/reviews/1'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(200);
    });
  });

  // ─── PUT /api/reviews/[id] ───────────────────────────────
  describe('PUT /api/reviews/[id]', () => {
    it('评价不存在 → 404', async () => {
      mockReviewService.update.mockRejectedValue(new NotFoundError('评价', 999));
      const res = await PUT(
        makeRequest('/api/reviews/999', 'PUT', { status: false }),
        { params: Promise.resolve({ id: '999' }) },
      );
      expect(res.status).toBe(404);
    });

    it('正常更新 → 200', async () => {
      mockReviewService.update.mockResolvedValue({ id: 1 });
      const res = await PUT(
        makeRequest('/api/reviews/1', 'PUT', { status: false }),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(200);
    });
  });

  // ─── DELETE /api/reviews/[id] ────────────────────────────
  describe('DELETE /api/reviews/[id]', () => {
    it('评价不存在 → 404', async () => {
      mockReviewService.delete.mockRejectedValue(new NotFoundError('评价', 999));
      const res = await DELETE_BY_ID(
        makeRequest('/api/reviews/999', 'DELETE'),
        { params: Promise.resolve({ id: '999' }) },
      );
      expect(res.status).toBe(404);
    });

    it('正常删除 → 200', async () => {
      mockReviewService.delete.mockResolvedValue({ success: true });
      const res = await DELETE_BY_ID(
        makeRequest('/api/reviews/1', 'DELETE'),
        { params: Promise.resolve({ id: '1' }) },
      );
      expect(res.status).toBe(200);
    });
  });

  // ─── GET /api/reviews/stats ──────────────────────────────
  describe('GET /api/reviews/stats', () => {
    it('缺少 productId → 400', async () => {
      const res = await GET_STATS(makeRequest('/api/reviews/stats'), { params: Promise.resolve({}) });
      expect(res.status).toBe(400);
    });

    it('产品不存在 → 404', async () => {
      mockReviewService.getStats.mockRejectedValue(new NotFoundError('产品', 999));
      const res = await GET_STATS(makeRequest('/api/reviews/stats?productId=999'), { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });

    it('正常查询 → 200', async () => {
      mockReviewService.getStats.mockResolvedValue({
        average: 4.5, total: 10, distribution: { 1: 0, 2: 0, 3: 1, 4: 3, 5: 6 },
      });
      const res = await GET_STATS(makeRequest('/api/reviews/stats?productId=1'), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });
  });
});

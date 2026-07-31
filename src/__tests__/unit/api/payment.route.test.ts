import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { NotFoundError, BusinessRuleError, ServiceError } from '@/lib/services/errors';

const mockPaymentService = {
  createPayment: vi.fn(),
  callback: vi.fn(),
};

vi.mock('@/lib/services/payment.service', () => ({ PaymentService: mockPaymentService }));

type Handler = (
  req: NextRequest,
  ctx: Record<string, unknown>,
) => Promise<NextResponse | Response>;

vi.mock('@/lib/api-middleware', async () => {
  function getErrorResponse(error: unknown) {
    if (error instanceof ServiceError) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    }
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
  return {
    withAuth: (handler: Handler) => async (req: NextRequest, ctx: Record<string, unknown>) => {
      try {
        return await handler(req, { ...ctx, user: { id: 1, role: 'customer' } });
      } catch (error) {
        return getErrorResponse(error);
      }
    },
    withRateLimit: (handler: Handler) => handler,
  };
});

const { POST } = await import('@/app/api/v1/payment/route');

function makeRequest(body: unknown): NextRequest {
  return new NextRequest(new URL('/api/payment', 'http://localhost:9090'), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('Payment API Route — ServiceError 映射测试', () => {
  beforeEach(() => vi.clearAllMocks());

  // ─── create ──────────────────────────────────────────────────

  describe('POST /api/payment (action=create)', () => {
    it('正常创建支付 → 200', async () => {
      mockPaymentService.createPayment.mockResolvedValue({ paymentId: 100, status: 'success' });

      const res = await POST(makeRequest({ action: 'create', orderId: 10, method: 'stripe' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.paymentId).toBe(100);
    });

    it('订单不存在 → 404', async () => {
      mockPaymentService.createPayment.mockRejectedValue(new NotFoundError('订单', 999));

      const res = await POST(makeRequest({ action: 'create', orderId: 999, method: 'stripe' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });

    it('订单状态不满足 → 422', async () => {
      mockPaymentService.createPayment.mockRejectedValue(new BusinessRuleError('订单状态必须为 confirmed 才能发起支付'));

      const res = await POST(makeRequest({ action: 'create', orderId: 10, method: 'stripe' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('缺少参数 → 422', async () => {
      const res = await POST(makeRequest({ action: 'create' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });
  });

  // ─── callback ────────────────────────────────────────────────

  describe('POST /api/payment (action=callback)', () => {
    it('正常回调 → 200', async () => {
      mockPaymentService.callback.mockResolvedValue(undefined);

      const res = await POST(makeRequest({ action: 'callback', paymentId: 100, status: 'success' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(200);
    });

    it('支付记录不存在 → 404', async () => {
      mockPaymentService.callback.mockRejectedValue(new NotFoundError('支付记录', 999));

      const res = await POST(makeRequest({ action: 'callback', paymentId: 999, status: 'success' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(404);
    });

    it('非法状态转换 → 422', async () => {
      mockPaymentService.callback.mockRejectedValue(new BusinessRuleError('无法从 success 转换到 failed'));

      const res = await POST(makeRequest({ action: 'callback', paymentId: 100, status: 'failed' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });

    it('缺少参数 → 422', async () => {
      const res = await POST(makeRequest({ action: 'callback' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });
  });

  // ─── unknown action ─────────────────────────────────────────

  describe('未知操作', () => {
    it('未知 action → 422', async () => {
      const res = await POST(makeRequest({ action: 'refund' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(422);
    });
  });

  // ─── 未捕获错误 → 500 ───────────────────────────────────────

  describe('未捕获异常', () => {
    it('非 ServiceError 异常 → 500', async () => {
      mockPaymentService.createPayment.mockRejectedValue(new Error('数据库连接失败'));

      const res = await POST(makeRequest({ action: 'create', orderId: 10, method: 'stripe' }), { params: Promise.resolve({}) });
      expect(res.status).toBe(500);
    });
  });
});

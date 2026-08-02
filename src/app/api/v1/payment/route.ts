import { NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { withAuth } from '@/lib/api-middleware';
import { BusinessRuleError } from '@/lib/services/errors';

/**
 * POST /api/payment — 登录用户可发起支付
 */
export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const { action, orderId, method, paymentId, status } = body;

  switch (action) {
    case 'create': {
      if (!orderId || !method) {
        throw new BusinessRuleError('请提供订单ID和支付方式');
      }
      const result = await PaymentService.createPayment(orderId, method, user.id);
      return NextResponse.json(result);
    }

    case 'callback': {
      if (!paymentId || !status) {
        throw new BusinessRuleError('请提供支付ID和状态');
      }
      await PaymentService.callback(paymentId, status);
      return NextResponse.json({ success: true });
    }

    default:
      throw new BusinessRuleError('未知操作');
  }
}, { rateLimit: { maxRequests: 10, windowMs: 60_000 } });

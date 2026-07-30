import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';
import { withAuth, withRateLimit } from '@/lib/api-middleware';

/**
 * POST /api/payment — 登录用户可发起支付
 */
export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const { action, orderNumber, paymentId } = body;

  switch (action) {
    case 'create': {
      const { orderId } = body;
      if (!orderId) {
        return NextResponse.json({ error: '请提供订单ID' }, { status: 400 });
      }
      // TODO: 验证订单属于当前用户
      const result = await PaymentService.createPayment(orderId);
      return NextResponse.json(result);
    }

    case 'confirm': {
      if (!orderNumber || !paymentId) {
        return NextResponse.json({ error: '请提供订单号和支付ID' }, { status: 400 });
      }
      await PaymentService.confirmPayment(orderNumber, paymentId);
      return NextResponse.json({ success: true });
    }

    case 'fail': {
      if (!orderNumber) {
        return NextResponse.json({ error: '请提供订单号' }, { status: 400 });
      }
      await PaymentService.failPayment(orderNumber);
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: '未知操作' }, { status: 400 });
  }
});

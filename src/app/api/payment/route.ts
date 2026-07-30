import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/services/payment.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderNumber, paymentId } = body;

    switch (action) {
      case 'create': {
        const { orderId } = body;
        if (!orderId) {
          return NextResponse.json({ error: '请提供订单ID' }, { status: 400 });
        }
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
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '支付处理失败' },
      { status: 500 }
    );
  }
}
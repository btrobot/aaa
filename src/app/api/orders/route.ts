import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId') ? Number(searchParams.get('customerId')) : undefined;
    const number = searchParams.get('number') || undefined;

    if (number) {
      const order = await OrderService.findByNumber(number);
      if (!order) {
        return NextResponse.json({ error: '订单不存在' }, { status: 404 });
      }
      return NextResponse.json(order);
    }

    if (customerId) {
      const orders = await OrderService.getCustomerOrders(customerId);
      return NextResponse.json(orders);
    }

    return NextResponse.json({ error: '请提供 customerId 或 number 参数' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取订单失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const order = await OrderService.create(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建订单失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: '请提供 id 和 status' }, { status: 400 });
    }
    const order = await OrderService.updateStatus(id, status);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新订单状态失败' },
      { status: 500 }
    );
  }
}
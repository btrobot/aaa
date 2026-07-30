import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await OrderService.getById(Number(id));
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: '获取订单失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    if (!status) {
      return NextResponse.json({ error: '请提供状态参数' }, { status: 400 });
    }
    const updated = await OrderService.updateStatus(Number(id), status);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : '更新订单失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
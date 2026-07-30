import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { withAuth, withAdmin } from '@/lib/api-middleware';

/**
 * GET /api/orders/[id] — 登录用户可查看自己的订单，管理员可查看任意订单
 */
export const GET = withAuth(async (
  request: NextRequest,
  { params, user }
) => {
  const { id } = await params;
  const order = await OrderService.getById(Number(id));
  if (!order) {
    return NextResponse.json({ error: '订单不存在' }, { status: 404 });
  }
  // 非管理员只能查看自己的订单
  if (user.role !== 'admin' && order.customerId !== user.id) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 });
  }
  return NextResponse.json(order);
});

/**
 * PUT /api/orders/[id] — 仅管理员可更新订单状态
 */
export const PUT = withAdmin(async (
  request: NextRequest,
  { params }
) => {
  const { id } = await params;
  const body = await request.json();
  const { status } = body;
  if (!status) {
    return NextResponse.json({ error: '请提供状态参数' }, { status: 400 });
  }
  const updated = await OrderService.updateStatus(Number(id), status);
  return NextResponse.json(updated);
});

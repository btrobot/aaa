import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/services/order.service';
import { withAuth, withAdmin, withMiddleware, cacheResponse } from '@/lib/api-middleware';
import { requireAuth } from '@/lib/auth';

/**
 * GET /api/orders
 * - 普通用户：只能查看自己的订单
 * - 管理员：可查看所有订单 (?admin=true)
 */
export const GET = withMiddleware(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const number = searchParams.get('number') || undefined;

  if (number) {
    const order = await OrderService.findByNumber(number);
    if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    return NextResponse.json(order);
  }

  // 管理员查看所有订单
  if (searchParams.get('admin') === 'true') {
    requireAuth(user!, ['admin']);
    const orders = await OrderService.getAll();
    return cacheResponse(NextResponse.json(orders), { maxAge: 10 });
  }

  // 普通用户查看自己的订单
  requireAuth(user!, ['customer']);
  const orders = await OrderService.getCustomerOrders(user!.id);
  return NextResponse.json(orders);
}, { auth: true, rateLimit: { maxRequests: 30, windowMs: 60_000 } });

/**
 * POST /api/orders — 登录用户可创建订单
 */
export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const order = await OrderService.create({ ...body, customerId: user.id });
  return NextResponse.json(order, { status: 201 });
}, { rateLimit: { maxRequests: 10, windowMs: 60_000 } });

/**
 * PUT /api/orders — 仅管理员可更新订单状态
 */
export const PUT = withAdmin(async (request) => {
  const body = await request.json();
  const { id, status } = body;
  if (!id || !status) {
    return NextResponse.json({ error: '请提供 id 和 status' }, { status: 400 });
  }
  const order = await OrderService.updateStatus(id, status);
  return NextResponse.json(order);
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });

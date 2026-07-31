import { NextResponse } from 'next/server';
import { CartService } from '@/lib/services/cart.service';
import { withAuth } from '@/lib/api-middleware';

/**
 * GET /api/cart — 获取当前登录用户的购物车
 * 使用 user.id 替代客户端传入的 customerId，防止 IDOR
 */
export const GET = withAuth(async (request, { user }) => {
  const locale = request.nextUrl.searchParams.get('locale') || 'zh_cn';
  const items = await CartService.getCart(user.id, locale);
  return NextResponse.json(items);
});

/**
 * POST /api/cart — 向当前登录用户的购物车添加商品
 */
export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const item = await CartService.addItem({ ...body, customerId: user.id });
  return NextResponse.json(item, { status: 201 });
});

/**
 * PUT /api/cart — 更新购物车商品数量（需验证所有权）
 */
export const PUT = withAuth(async (request, { user }) => {
  const body = await request.json();
  const item = await CartService.updateQuantity(body.id, body.quantity, user.id);
  return NextResponse.json(item);
});

/**
 * DELETE /api/cart — 删除购物车商品（需验证所有权）
 */
export const DELETE = withAuth(async (request, { user }) => {
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ error: '请提供 id' }, { status: 400 });
  }
  await CartService.removeItem(user.id, id);
  return NextResponse.json({ success: true });
});

import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { withAuth } from '@/lib/api-middleware';

/**
 * GET /api/customers/wishlist — 获取当前用户的收藏夹
 */
export const GET = withAuth(async (request, { user }) => {
  
  const items = await CustomerService.getWishlist(user.id);
  return NextResponse.json(items);
});

/**
 * POST /api/customers/wishlist — 添加到收藏夹
 */
export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const item = await CustomerService.addToWishlist(user.id, body.productId);
  return NextResponse.json(item, { status: 201 });
});

/**
 * DELETE /api/customers/wishlist — 从收藏夹移除
 */
export const DELETE = withAuth(async (request, { user }) => {
  const productId = Number(request.nextUrl.searchParams.get('productId'));
  if (!productId) {
    return NextResponse.json({ error: '请提供 productId' }, { status: 400 });
  }
  await CustomerService.removeFromWishlist(user.id, productId);
  return NextResponse.json({ success: true });
});

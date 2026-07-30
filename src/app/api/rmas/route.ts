import { NextRequest, NextResponse } from 'next/server';
import { RmaService } from '@/lib/services/rma.service';
import { withAuth, withMiddleware } from '@/lib/api-middleware';

/**
 * GET /api/rmas
 * - 普通用户：查看自己的退换货
 * - 管理员：查看所有退换货
 */
export const GET = withMiddleware(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  // 普通用户只能查看自己的
  if (!user || user.role !== 'admin') {
    const userId = user?.id;
    if (!userId) return NextResponse.json({ error: '请先登录' }, { status: 401 });
    const items = await RmaService.getByCustomerId(userId, status);
    return NextResponse.json({ items, total: items.length });
  }

  // 管理员查看所有
  const result = await RmaService.getAll({ status, page, pageSize });
  return NextResponse.json(result);
}, { auth: true });

/**
 * POST /api/rmas — 登录用户可创建退换货申请
 */
export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const rma = await RmaService.create({ ...body, customerId: user.id });
  return NextResponse.json(rma, { status: 201 });
});

import { NextResponse } from 'next/server';
import { RmaService } from '@/lib/services/rma.service';
import { withMiddleware } from '@/lib/api-middleware';

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
    if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });
    const items = await RmaService.getByCustomerId(user.id, status);
    return NextResponse.json({ items, total: items.length });
  }

  // 管理员查看所有
  const result = await RmaService.getAll({ status, page, pageSize });
  return NextResponse.json(result);
}, { auth: true, rateLimit: { maxRequests: 30, windowMs: 60_000 } });

/**
 * POST /api/rmas — 登录用户可创建退换货申请
 */
export const POST = withMiddleware(async (request, { user }) => {
  if (!user) return NextResponse.json({ error: '请先登录' }, { status: 401 });
  const body = await request.json();
  const rma = await RmaService.create(user.id, body);
  return NextResponse.json(rma, { status: 201 });
}, { auth: true, rateLimit: { maxRequests: 10, windowMs: 60_000 } });

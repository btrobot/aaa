import { NextRequest, NextResponse } from 'next/server';
import { RmaService } from '@/lib/services/rma.service';
import { withAuth, withAdmin } from '@/lib/api-middleware';

/**
 * GET /api/rmas/[id] — 登录用户可查看自己的退换货单，管理员可查看任意
 */
export const GET = withAuth(async (
  _request: NextRequest,
  { params, user }
) => {
  const { id } = await params;
  const rma = await RmaService.findById(parseInt(id));
  // 非管理员只能查看自己的
  if (user.role !== 'admin' && rma.customerId !== user.id) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 });
  }
  return NextResponse.json(rma);
});

/**
 * PUT /api/rmas/[id] — 管理员可更新退换货状态
 */
export const PUT = withAdmin(async (
  request: NextRequest,
  { params }
) => {
  const { id } = await params;
  const body = await request.json();
  const result = await RmaService.updateStatus(parseInt(id), body);
  return NextResponse.json(result);
});

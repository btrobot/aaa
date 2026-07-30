import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification.service';
import { withAuth, withAdmin } from '@/lib/api-middleware';

/**
 * GET /api/notifications — 登录用户查看自己的通知
 */
export const GET = withAuth(async (request, { user }) => {
  const unreadOnly = request.nextUrl.searchParams.get('unreadOnly') === 'true';
  const result = await notificationService.list({
    notifiableId: user.id,
    notifiableType: 'customer',
    unreadOnly: unreadOnly || undefined,
  });
  return NextResponse.json(result);
});

/**
 * POST /api/notifications — 仅管理员可创建通知
 */
export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const notification = await notificationService.create({
    type: body.type,
    data: body.data,
    notifiableId: body.notifiableId,
    notifiableType: body.notifiableType,
  });
  return NextResponse.json(notification, { status: 201 });
});

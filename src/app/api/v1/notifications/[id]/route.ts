import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification.service';
import { withAuth } from '@/lib/api-middleware';

export const GET = withAuth(async (
  _request: NextRequest,
  { params, user }
) => {
  const { id } = await params;
  const notification = await notificationService.getById(Number(id));
  if (!notification) {
    return NextResponse.json({ error: '通知不存在' }, { status: 404 });
  }
  // 验证通知所有权
  if (notification.notifiableId !== user.id) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 });
  }
  return NextResponse.json(notification);
});

export const PUT = withAuth(async (
  request: NextRequest,
  { params, user }
) => {
  const { id } = await params;
  await request.json();
  // 先验证所有权
  const notification = await notificationService.getById(Number(id));
  if (!notification || notification.notifiableId !== user.id) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 });
  }
  const updated = await notificationService.markAsRead(Number(id));
  return NextResponse.json(updated);
});

export const DELETE = withAuth(async (
  _request: NextRequest,
  { params, user }
) => {
  const { id } = await params;
  // 先验证所有权
  const notification = await notificationService.getById(Number(id));
  if (!notification || notification.notifiableId !== user.id) {
    return NextResponse.json({ error: '权限不足' }, { status: 403 });
  }
  await notificationService.delete(Number(id));
  return NextResponse.json({ success: true });
});

import { NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification.service';
import { withAuth } from '@/lib/api-middleware';

export const POST = withAuth(async (_request, { user }) => {
  await notificationService.markAllAsRead(user.id, 'customer');
  return NextResponse.json({ success: true });
});

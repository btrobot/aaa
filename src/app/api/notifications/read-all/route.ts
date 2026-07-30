import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === 'mark_all_read') {
      await notificationService.markAllAsRead(
        body.notifiableId ? Number(body.notifiableId) : undefined,
        body.notifiableType || undefined,
      );
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Failed to mark all as read:', error);
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
  }
}
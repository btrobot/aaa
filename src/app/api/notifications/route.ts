import { NextRequest, NextResponse } from 'next/server';
import { notificationService } from '@/lib/services/notification.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notifiableId = searchParams.get('notifiableId');
    const notifiableType = searchParams.get('notifiableType');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const result = await notificationService.list({
      notifiableId: notifiableId ? Number(notifiableId) : undefined,
      notifiableType: notifiableType || undefined,
      unreadOnly: unreadOnly || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const notification = await notificationService.create({
      type: body.type,
      data: body.data,
      notifiableId: body.notifiableId,
      notifiableType: body.notifiableType,
    });
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}
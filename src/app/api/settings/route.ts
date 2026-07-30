import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/lib/services/settings.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || undefined;
    const data = await settingsService.getAll(locale);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: '获取设置失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings: data, locale } = body;
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    const result = await settingsService.updateAll(data, locale || undefined);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: '更新设置失败' }, { status: 500 });
  }
}
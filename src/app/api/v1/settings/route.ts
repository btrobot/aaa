import { NextRequest, NextResponse } from 'next/server';
import { settingsService } from '@/lib/services/settings.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async (request: NextRequest) => {
  const locale = request.nextUrl.searchParams.get('locale') || undefined;
  const data = await settingsService.getAll(locale);
  return cacheResponse(NextResponse.json(data), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const PUT = withAdmin(async (request) => {
  const body = await request.json();
  const { settings: data, locale } = body;
  if (!data || typeof data !== 'object') {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }
  const result = await settingsService.updateAll(data, locale || undefined);
  return NextResponse.json(result);
});

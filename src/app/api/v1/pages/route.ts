import { NextRequest, NextResponse } from 'next/server';
import { PageService } from '@/lib/services/page.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async (request: NextRequest) => {
  const locale = request.nextUrl.searchParams.get('locale') || 'zh_cn';
  const statusParam = request.nextUrl.searchParams.get('status');
  const status = statusParam !== null ? statusParam === 'true' : undefined;
  const result = await PageService.search({ locale, status });
  return cacheResponse(NextResponse.json(result), { maxAge: 30 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const page = await PageService.create(body);
  return NextResponse.json(page, { status: 201 });
});

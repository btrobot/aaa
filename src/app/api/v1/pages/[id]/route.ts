import { NextRequest, NextResponse } from 'next/server';
import { PageService } from '@/lib/services/page.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const locale = request.nextUrl.searchParams.get('locale') || 'zh_cn';
  const page = await PageService.getById(Number(id), locale);
  return cacheResponse(NextResponse.json(page), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const PUT = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const page = await PageService.update(Number(id), body);
  return NextResponse.json(page);
});

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await PageService.delete(Number(id));
  return NextResponse.json({ success: true });
});

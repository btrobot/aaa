import { NextRequest, NextResponse } from 'next/server';
import { BrandService } from '@/lib/services/brand.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const brand = await BrandService.findById(Number(id));
  if (!brand) {
    return NextResponse.json({ error: '品牌不存在' }, { status: 404 });
  }
  return cacheResponse(NextResponse.json(brand), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const PUT = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const result = await BrandService.update(Number(id), body);
  return NextResponse.json(result);
});

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await BrandService.delete(Number(id));
  return NextResponse.json({ success: true });
});

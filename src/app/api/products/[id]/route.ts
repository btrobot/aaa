import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';



export const GET = withMiddleware(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const product = await ProductService.findById(Number(id));
  if (!product) {
    return NextResponse.json({ error: '产品不存在' }, { status: 404 });
  }
  return cacheResponse(NextResponse.json(product), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const PUT = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const product = await ProductService.update(Number(id), body);
  return NextResponse.json(product);
});

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await ProductService.delete(Number(id));
  return NextResponse.json({ success: true });
});

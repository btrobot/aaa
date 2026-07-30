import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';
import { withRateLimit, cacheResponse } from '@/lib/api-middleware';



export const GET = withRateLimit(async (request: NextRequest) => {
  const productId = request.nextUrl.searchParams.get('productId')
    ? Number(request.nextUrl.searchParams.get('productId'))
    : undefined;
  if (!productId) {
    return NextResponse.json({ error: '请提供 productId' }, { status: 400 });
  }
  const stats = await ReviewService.getStats(productId);
  return cacheResponse(NextResponse.json(stats), { maxAge: 60 });
}, { maxRequests: 60, windowMs: 60_000 });

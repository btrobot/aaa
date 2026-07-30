import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';
import { withAuth, withRateLimit, cacheResponse } from '@/lib/api-middleware';



export const GET = withRateLimit(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') ? Number(searchParams.get('productId')) : undefined;
  const status = searchParams.get('status') !== null ? searchParams.get('status') === 'true' : undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');

  if (productId) {
    const items = await ReviewService.getByProductId(productId, status);
    return cacheResponse(NextResponse.json(items), { maxAge: 30 });
  }

  const result = await ReviewService.getAll({ status, page, pageSize });
  return cacheResponse(NextResponse.json(result), { maxAge: 30 });
}, { maxRequests: 60, windowMs: 60_000 });

export const POST = withAuth(async (request, { user }) => {
  const body = await request.json();
  const review = await ReviewService.create({ ...body, customerId: user.id });
  return NextResponse.json(review, { status: 201 });
});

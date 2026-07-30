import { NextRequest, NextResponse } from 'next/server';
import { ShippingService } from '@/lib/services/shipping.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || undefined;
  const status = searchParams.get('status') !== null
    ? searchParams.get('status') === 'true'
    : undefined;
  const methods = await ShippingService.list({ locale, status });
  return cacheResponse(NextResponse.json(methods), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const method = await ShippingService.create(body);
  return NextResponse.json(method, { status: 201 });
});

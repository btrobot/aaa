import { NextResponse } from 'next/server';
import { BrandService } from '@/lib/services/brand.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async () => {
  const brands = await BrandService.findAll();
  return cacheResponse(NextResponse.json(brands), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const brand = await BrandService.create(body);
  return NextResponse.json(brand, { status: 201 });
});

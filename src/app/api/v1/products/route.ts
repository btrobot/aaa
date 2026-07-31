import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';



export const GET = withMiddleware(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || undefined;
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
  const brandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : undefined;
  const minPrice = searchParams.get('minPrice') || undefined;
  const maxPrice = searchParams.get('maxPrice') || undefined;
  const locale = searchParams.get('locale') || 'zh_cn';
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 12;
  const sortBy = (searchParams.get('sortBy') as 'sortOrder' | 'createdAt' | 'price' | 'sales') || 'sortOrder';
  const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

  const result = await ProductService.search({
    locale, page, pageSize, sortBy, sortOrder,
    keyword, categoryId, brandId, minPrice, maxPrice,
  });

  return cacheResponse(NextResponse.json(result), { maxAge: 30 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const product = await ProductService.create(body);
  return NextResponse.json(product, { status: 201 });
});

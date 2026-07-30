import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/category.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';



export const GET = withMiddleware(async (request: NextRequest) => {
  const locale = request.nextUrl.searchParams.get('locale') || 'zh_cn';
  const categories = await CategoryService.getTree(locale);
  return cacheResponse(NextResponse.json(categories), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const category = await CategoryService.create({
    parentId: body.parentId ?? null,
    status: body.status ?? true,
    descriptions: body.descriptions,
  });
  return NextResponse.json(category, { status: 201 });
});

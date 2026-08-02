import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/category.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

/**
 * 将前端格式 { name, locale, parentId, status } 转为 CreateCategoryInput
 */
function toCreateInput(body: Record<string, unknown>) {
  const name = String(body.name || '');
  const locale = String(body.locale || 'zh_cn');
  return {
    parentId: (body.parentId as number | null) ?? null,
    status: body.status !== undefined ? Boolean(body.status) : true,
    sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : 0,
    descriptions: {
      [locale]: {
        name,
        description: body.description ? String(body.description) : undefined,
      },
    },
  };
}

export const GET = withMiddleware(async (request: NextRequest) => {
  const locale = request.nextUrl.searchParams.get('locale') || 'zh_cn';
  const categories = await CategoryService.getTree(locale);
  return cacheResponse(NextResponse.json(categories), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const category = await CategoryService.create(toCreateInput(body));
  return NextResponse.json(category, { status: 201 });
});

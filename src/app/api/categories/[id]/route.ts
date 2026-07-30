import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/category.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const category = await CategoryService.findById(Number(id));
  return cacheResponse(NextResponse.json(category), { maxAge: 60 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const PUT = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const name = body.name ? String(body.name) : undefined;
  const locale = body.locale ? String(body.locale) : undefined;
  const category = await CategoryService.update(Number(id), {
    parentId: body.parentId !== undefined ? body.parentId : undefined,
    status: body.status !== undefined ? Boolean(body.status) : undefined,
    slug: body.slug ? String(body.slug) : undefined,
    ...(name && locale ? {
      descriptions: {
        [locale]: { name, description: body.description ? String(body.description) : undefined },
      },
    } : {}),
  });
  return NextResponse.json(category);
});

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await CategoryService.delete(Number(id));
  return NextResponse.json({ success: true });
});

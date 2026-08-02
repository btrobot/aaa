import { NextRequest, NextResponse } from 'next/server';
import { TaxService } from '@/lib/services/tax.service';
import { withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withAdmin(async () => {
  const items = await TaxService.listTaxClasses();
  return cacheResponse(NextResponse.json(items), { maxAge: 300 });
});

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json();
  if (!body.title || typeof body.title !== 'string') {
    return NextResponse.json({ error: 'title 为必填字段' }, { status: 400 });
  }
  const cls = await TaxService.createTaxClass(body);
  return NextResponse.json(cls, { status: 201 });
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });

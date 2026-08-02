import { NextRequest, NextResponse } from 'next/server';
import { TaxService } from '@/lib/services/tax.service';
import { withAdmin } from '@/lib/api-middleware';

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json();
  if (!body.taxClassId || !body.name || !body.rate) {
    return NextResponse.json({ error: 'taxClassId、name、rate 为必填字段' }, { status: 400 });
  }
  const rate = await TaxService.createTaxRate(body);
  return NextResponse.json(rate, { status: 201 });
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });

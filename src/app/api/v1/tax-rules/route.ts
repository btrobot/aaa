import { NextRequest, NextResponse } from 'next/server';
import { TaxService } from '@/lib/services/tax.service';
import { withAdmin } from '@/lib/api-middleware';

export const POST = withAdmin(async (request: NextRequest) => {
  const body = await request.json();
  if (!body.taxClassId || !body.taxRateId) {
    return NextResponse.json({ error: 'taxClassId、taxRateId 为必填字段' }, { status: 400 });
  }
  const rule = await TaxService.createTaxRule(body);
  return NextResponse.json(rule, { status: 201 });
});

import { NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';
import { withAuth } from '@/lib/api-middleware';

export const GET = withAuth(async (request, { user }) => {
  const customer = await CustomerService.findById(user.id);
  if (!customer) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 });
  }
  return NextResponse.json(customer);
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });

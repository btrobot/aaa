import { NextResponse } from 'next/server';
import { CustomerGroupService } from '@/lib/services/customer-group.service';
import { withMiddleware, withAdmin, cacheResponse } from '@/lib/api-middleware';

export const GET = withMiddleware(async () => {
  const groups = await CustomerGroupService.list();
  return cacheResponse(NextResponse.json(groups), { maxAge: 30 });
}, { rateLimit: { maxRequests: 60, windowMs: 60_000 } });

export const POST = withAdmin(async (request) => {
  const body = await request.json();
  const group = await CustomerGroupService.create(body);
  return NextResponse.json(group, { status: 201 });
});

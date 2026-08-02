import { NextRequest, NextResponse } from 'next/server';
import { CustomerGroupService } from '@/lib/services/customer-group.service';
import { withAdmin } from '@/lib/api-middleware';

export const PUT = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const group = await CustomerGroupService.update(Number(id), body);
  return NextResponse.json(group);
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await CustomerGroupService.delete(Number(id));
  return NextResponse.json({ success: true });
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });

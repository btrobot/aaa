import { NextRequest, NextResponse } from 'next/server';
import { CustomerGroupService } from '@/lib/services/customer-group.service';
import { withAdmin } from '@/lib/api-middleware';

const customerGroupService = new CustomerGroupService();

export const PUT = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const group = await customerGroupService.update(Number(id), body);
  return NextResponse.json(group);
});

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await customerGroupService.delete(Number(id));
  return NextResponse.json({ success: true });
});

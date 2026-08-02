import { NextRequest, NextResponse } from 'next/server';
import { ShippingService } from '@/lib/services/shipping.service';
import { withAdmin } from '@/lib/api-middleware';

export const PUT = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const methods = await ShippingService.update(Number(id), body);
  return NextResponse.json(methods);
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await ShippingService.delete(Number(id));
  return NextResponse.json({ success: true });
}, { rateLimit: { maxRequests: 30, windowMs: 60_000 } });

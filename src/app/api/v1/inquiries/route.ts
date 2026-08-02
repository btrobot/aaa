import { NextRequest, NextResponse } from 'next/server';
import { InquiryService } from '@/lib/services/inquiry.service';
import { withAuth, withRateLimit } from '@/lib/api-middleware';

export const POST = withRateLimit(async (request: NextRequest) => {
  const body = await request.json();
  const inquiry = await InquiryService.create(body, body.customerId || undefined);
  return NextResponse.json(inquiry, { status: 201 });
}, { maxRequests: 30, windowMs: 60_000 });

export const GET = withAuth(async (request, { user }) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '20');
  const result = await InquiryService.list(user.id, page, pageSize);
  return NextResponse.json(result);
});
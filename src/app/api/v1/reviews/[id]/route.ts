import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';
import { withRateLimit, withAdmin } from '@/lib/api-middleware';

export const GET = withRateLimit(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const review = await ReviewService.findById(Number(id));
  return NextResponse.json(review);
}, { maxRequests: 60, windowMs: 60_000 });

export const PUT = withAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const body = await request.json();
  const review = await ReviewService.update(Number(id), body);
  return NextResponse.json(review);
});

export const DELETE = withAdmin(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  await ReviewService.delete(Number(id));
  return NextResponse.json({ success: true });
});

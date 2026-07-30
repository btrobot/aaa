import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const review = await ReviewService.findById(parseInt(id));
    if (!review) return NextResponse.json({ error: '评价不存在' }, { status: 404 });
    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取评价失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await ReviewService.update(parseInt(id), body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '更新评价失败' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await ReviewService.delete(parseInt(id));
    if (!success) return NextResponse.json({ error: '评价不存在' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '删除评价失败' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) return NextResponse.json({ error: '缺少 productId 参数' }, { status: 400 });
    const stats = await ReviewService.getStats(parseInt(productId));
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取评价统计失败' }, { status: 500 });
  }
}
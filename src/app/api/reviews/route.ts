import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/review.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (productId) {
      const items = await ReviewService.getByProductId(
        parseInt(productId),
        status !== null ? status === 'true' : undefined
      );
      return NextResponse.json({ items, total: items.length });
    }

    const result = await ReviewService.getAll({
      status: status !== null ? status === 'true' : undefined,
      page,
      pageSize,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取评价列表失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const review = await ReviewService.create(body);
    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '创建评价失败' }, { status: 500 });
  }
}
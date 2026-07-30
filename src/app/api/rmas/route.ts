import { NextRequest, NextResponse } from 'next/server';
import { RmaService } from '@/lib/services/rma.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (customerId) {
      const items = await RmaService.getByCustomerId(parseInt(customerId), status || undefined);
      return NextResponse.json({ items, total: items.length });
    }

    const result = await RmaService.getAll({
      status: status || undefined,
      page,
      pageSize,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取退换货列表失败' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rma = await RmaService.create(body);
    return NextResponse.json(rma, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '创建退换货申请失败' }, { status: 500 });
  }
}
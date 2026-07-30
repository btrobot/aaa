import { NextRequest, NextResponse } from 'next/server';
import { RmaService } from '@/lib/services/rma.service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const rma = await RmaService.findById(parseInt(id));
    if (!rma) return NextResponse.json({ error: '退换货单不存在' }, { status: 404 });
    return NextResponse.json(rma);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '获取退换货单失败' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await RmaService.update(parseInt(id), body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '更新退换货单失败' }, { status: 500 });
  }
}
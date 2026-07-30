import { NextRequest, NextResponse } from 'next/server';
import { ShippingService } from '@/lib/services/shipping.service';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const methods = await ShippingService.update(Number(id), body);
    return NextResponse.json(methods);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新配送方式失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await ShippingService.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除配送方式失败' },
      { status: 500 }
    );
  }
}
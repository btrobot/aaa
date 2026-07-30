import { NextRequest, NextResponse } from 'next/server';
import { ShippingService } from '@/lib/services/shipping.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || undefined;
    const status = searchParams.get('status') !== null
      ? searchParams.get('status') === 'true'
      : undefined;

    const methods = await ShippingService.list({ locale, status });
    return NextResponse.json(methods);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取配送方式失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const method = await ShippingService.create(body);
    return NextResponse.json(method, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建配送方式失败' },
      { status: 500 }
    );
  }
}
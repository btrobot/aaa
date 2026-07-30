import { NextRequest, NextResponse } from 'next/server';
import { CartService } from '@/lib/services/cart.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = Number(searchParams.get('customerId'));
    if (!customerId) {
      return NextResponse.json({ error: '请提供 customerId' }, { status: 400 });
    }
    const items = await CartService.getCart(customerId);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取购物车失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const item = await CartService.addItem(body);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '添加购物车失败' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update': {
        const { id, quantity } = body;
        const item = await CartService.updateQuantity(id, quantity);
        return NextResponse.json(item);
      }
      case 'toggleSelect': {
        const { id, selected } = body;
        const item = await CartService.toggleSelect(id, selected);
        return NextResponse.json(item);
      }
      case 'clear': {
        const { customerId } = body;
        await CartService.clearCart(customerId);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '操作购物车失败' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = Number(searchParams.get('customerId'));
    const cartId = Number(searchParams.get('id'));
    if (!customerId || !cartId) {
      return NextResponse.json({ error: '请提供 customerId 和 id' }, { status: 400 });
    }
    await CartService.removeItem(customerId, cartId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除购物车商品失败' },
      { status: 500 }
    );
  }
}
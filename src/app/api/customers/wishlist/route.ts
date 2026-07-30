import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: '请提供客户ID' }, { status: 400 });

    const items = await CustomerService.getWishlist(Number(id));
    const products = items.map((item: any) => ({
      id: item.productId,
      name: item.product?.name || `Product #${item.productId}`,
      price: item.product?.price || 0,
      image: item.product?.image || null,
    }));
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to get wishlist:', error);
    return NextResponse.json({ error: '获取收藏夹失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, productId } = body;
    if (!customerId || !productId) {
      return NextResponse.json({ error: '请提供 customerId 和 productId' }, { status: 400 });
    }
    const item = await CustomerService.addToWishlist(customerId, productId);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Failed to add wishlist:', error);
    return NextResponse.json({ error: '添加收藏失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const productId = searchParams.get('productId');
    if (!customerId || !productId) {
      return NextResponse.json({ error: '请提供 customerId 和 productId' }, { status: 400 });
    }
    const success = await CustomerService.removeFromWishlist(Number(customerId), Number(productId));
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Failed to remove wishlist:', error);
    return NextResponse.json({ error: '移除收藏失败' }, { status: 500 });
  }
}
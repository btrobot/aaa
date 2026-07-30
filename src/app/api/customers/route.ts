import { NextRequest, NextResponse } from 'next/server';
import { CustomerService } from '@/lib/services/customer.service';

/**
 * GET /api/customers
 * 客户信息/列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    if (id) {
      const customer = await CustomerService.findById(id);
      if (!customer) {
        return NextResponse.json({ error: '客户不存在' }, { status: 404 });
      }
      return NextResponse.json(customer);
    }

    if (searchParams.get('admin') === 'true') {
      const all = await CustomerService.findAll();
      return NextResponse.json(all);
    }

    return NextResponse.json({ error: '请提供客户ID' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取客户信息失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 * 更新客户信息
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'updateProfile': {
        const customer = await CustomerService.updateProfile(data.id, data);
        return NextResponse.json(customer);
      }
      case 'addAddress': {
        const address = await CustomerService.addAddress(data.customerId, data);
        return NextResponse.json(address, { status: 201 });
      }
      case 'getAddresses': {
        const addresses = await CustomerService.getAddresses(data.customerId);
        return NextResponse.json(addresses);
      }
      case 'deleteAddress': {
        await CustomerService.deleteAddress(data.customerId, data.addressId);
        return NextResponse.json({ success: true });
      }
      case 'addToWishlist': {
        const item = await CustomerService.addToWishlist(data.customerId, data.productId);
        return NextResponse.json(item, { status: 201 });
      }
      case 'removeFromWishlist': {
        await CustomerService.removeFromWishlist(data.customerId, data.productId);
        return NextResponse.json({ success: true });
      }
      case 'getWishlist': {
        const items = await CustomerService.getWishlist(data.customerId);
        return NextResponse.json(items);
      }
      default:
        return NextResponse.json({ error: '未知操作' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '操作失败' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';

/**
 * GET /api/products/[id]
 * 产品详情
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: '无效的产品ID' }, { status: 400 });
    }

    const product = await ProductService.findById(productId);
    if (!product) {
      return NextResponse.json({ error: '产品不存在' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/products/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取产品详情失败' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/products/[id]
 * 更新产品
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: '无效的产品ID' }, { status: 400 });
    }

    const body = await request.json();
    const product = await ProductService.update(productId, body);
    return NextResponse.json(product);
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新产品失败' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/products/[id]
 * 删除产品
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = Number(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: '无效的产品ID' }, { status: 400 });
    }

    const result = await ProductService.delete(productId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '删除产品失败' },
      { status: 500 }
    );
  }
}
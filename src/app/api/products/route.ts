import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/services/product.service';

/**
 * GET /api/products
 * 产品列表 / 搜索 / 筛选 / 分页（使用 ProductService.search 方法）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || undefined;
    const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined;
    const brandId = searchParams.get('brandId') ? Number(searchParams.get('brandId')) : undefined;
    const minPrice = searchParams.get('minPrice') || undefined;
    const maxPrice = searchParams.get('maxPrice') || undefined;
    const locale = searchParams.get('locale') || 'zh_cn';
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 12;
    const sortBy = (searchParams.get('sortBy') as 'sortOrder' | 'createdAt' | 'price' | 'sales') || 'sortOrder';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const result = await ProductService.search({
      locale,
      page,
      pageSize,
      sortBy,
      sortOrder,
      keyword,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取产品列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * 创建产品
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const product = await ProductService.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: '输入验证失败', details: JSON.parse(error.message) },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建产品失败' },
      { status: 500 }
    );
  }
}
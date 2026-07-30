import { NextRequest, NextResponse } from 'next/server';
import { BrandService } from '@/lib/services/brand.service';

/**
 * GET /api/brands
 * 品牌列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword') || undefined;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 20;

    const result = await BrandService.findAll({
      page,
      limit: pageSize,
      sort: 'asc',
      status: undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取品牌列表失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/brands
 * 创建品牌
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brand = await BrandService.create({
      name: body.name,
      description: body.description,
      website: body.website,
      logo: body.logo,
      sortOrder: body.sortOrder ?? 0,
      status: body.status ?? true,
    });
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建品牌失败' },
      { status: 500 }
    );
  }
}
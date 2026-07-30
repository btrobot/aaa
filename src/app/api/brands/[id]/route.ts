import { NextRequest, NextResponse } from 'next/server';
import { BrandService } from '@/lib/services/brand.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brand = await BrandService.findById(Number(id));
    if (!brand) {
      return NextResponse.json({ error: '品牌不存在' }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (error) {
    console.error('获取品牌失败:', error);
    return NextResponse.json({ error: '获取品牌失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await BrandService.update(Number(id), body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('更新品牌失败:', error);
    return NextResponse.json({ error: '更新品牌失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await BrandService.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除品牌失败:', error);
    return NextResponse.json({ error: '删除品牌失败' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/category.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await CategoryService.findById(Number(id));
    if (!category) {
      return NextResponse.json({ error: '分类不存在' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error('获取分类失败:', error);
    return NextResponse.json({ error: '获取分类失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await CategoryService.update(Number(id), body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('更新分类失败:', error);
    return NextResponse.json({ error: '更新分类失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await CategoryService.delete(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除分类失败:', error);
    return NextResponse.json({ error: '删除分类失败' }, { status: 500 });
  }
}
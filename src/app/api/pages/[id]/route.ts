import { NextRequest, NextResponse } from 'next/server';
import { pageService } from '@/lib/services/page.service';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'zh_cn';

    const page = await pageService.getById(id, locale);
    if (!page) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    console.error('获取文章详情失败:', error);
    return NextResponse.json({ error: '获取文章失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const body = await request.json();
    const page = await pageService.update(id, body);
    if (!page) return NextResponse.json({ error: '文章不存在' }, { status: 404 });
    return NextResponse.json(page);
  } catch (error) {
    console.error('更新文章失败:', error);
    return NextResponse.json({ error: '更新文章失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    await pageService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('删除文章失败:', error);
    return NextResponse.json({ error: '删除文章失败' }, { status: 500 });
  }
}
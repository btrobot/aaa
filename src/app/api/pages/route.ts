import { NextRequest, NextResponse } from 'next/server';
import { pageService } from '@/lib/services/page.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'zh_cn';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');
    const status = searchParams.has('status') ? searchParams.get('status') === 'true' : undefined;

    const result = await pageService.search({ locale, status, page, pageSize });
    return NextResponse.json(result);
  } catch (error) {
    console.error('获取文章列表失败:', error);
    return NextResponse.json({ error: '获取文章列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const page = await pageService.create(body);
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('创建文章失败:', error);
    return NextResponse.json({ error: '创建文章失败' }, { status: 500 });
  }
}
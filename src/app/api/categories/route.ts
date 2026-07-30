import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/category.service';

/**
 * GET /api/categories
 * 分类列表（树形结构）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale') || 'zh_cn';
    const id = searchParams.get('id') ? Number(searchParams.get('id')) : undefined;

    if (id) {
      const category = await CategoryService.findById(id);
      if (!category) {
        return NextResponse.json({ error: '分类不存在' }, { status: 404 });
      }
      return NextResponse.json(category);
    }

    const tree = await CategoryService.getTree(locale);
    return NextResponse.json(tree);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '获取分类失败' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * 创建分类
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const category = await CategoryService.create({
      parentId: body.parentId ?? null,
      status: body.status ?? true,
      descriptions: {
        zh_cn: { name: body.name?.zh_cn || body.name || '', description: body.description?.zh_cn || body.description },
        en: { name: body.name?.en || body.name || '', description: body.description?.en || body.description },
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建分类失败' },
      { status: 500 }
    );
  }
}

// PUT/DELETE 移至 /api/categories/[id]/route.ts
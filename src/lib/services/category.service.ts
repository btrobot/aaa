import { db } from '@/lib/db/db';
import { categories, categoryDescriptions, categoryPaths, productCategories } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NotFoundError, BusinessRuleError } from './errors';

const MAX_DEPTH = 5;

export interface CreateCategoryInput {
  parentId: number | null;
  slug: string;
  sortOrder?: number;
  status?: boolean;
  descriptions: Record<string, { name: string; description?: string }>;
}

export interface CategoryTreeItem {
  id: number;
  parentId: number | null;
  slug: string;
  name: string;
  status: boolean;
  sortOrder: number;
  children: CategoryTreeItem[];
}

export const CategoryService = {
  /**
   * 创建分类
   * pre: slug 唯一、parentId 存在或为 null、层级 ≤ 5
   */
  async create(input: CreateCategoryInput) {
    // pre: slug 唯一
    const [existingSlug] = await db.select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, input.slug))
      .limit(1);
    if (existingSlug) {
      throw new BusinessRuleError(`slug "${input.slug}" 已存在`);
    }

    // pre: parentId 存在或为 null
    if (input.parentId !== null && input.parentId !== undefined) {
      const [parent] = await db.select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, input.parentId))
        .limit(1);
      if (!parent) throw new NotFoundError('父分类', input.parentId);

      // pre: 层级深度 ≤ 5
      const depth = await CategoryService.getDepth(input.parentId);
      if (depth + 1 > MAX_DEPTH) {
        throw new BusinessRuleError(`分类层级不能超过 ${MAX_DEPTH} 级`);
      }
    }

    // 创建分类
    const [category] = await db.insert(categories).values({
      parentId: input.parentId ?? null,
      slug: input.slug,
      sortOrder: input.sortOrder ?? 0,
      status: input.status ?? true,
    }).returning();

    // 创建多语言描述
    for (const [locale, desc] of Object.entries(input.descriptions)) {
      await db.insert(categoryDescriptions).values({
        categoryId: category.id,
        locale,
        name: desc.name,
        description: desc.description || null,
      });
    }

    // 重建 CategoryPath
    await CategoryService.rebuildPaths(category.id, input.parentId);

    return category;
  },

  /**
   * 获取分类树
   */
  async getTree(locale: string = 'zh_cn'): Promise<CategoryTreeItem[]> {
    const rows = await db.select()
      .from(categories)
      .leftJoin(categoryDescriptions, and(
        eq(categories.id, categoryDescriptions.categoryId),
        eq(categoryDescriptions.locale, locale)
      ))
      .orderBy(categories.sortOrder);

    const map = new Map<number, CategoryTreeItem>();
    const roots: CategoryTreeItem[] = [];

    for (const row of rows) {
      const cat = row.categories;
      const desc = row.category_descriptions;
      const item: CategoryTreeItem = {
        id: cat.id,
        parentId: cat.parentId,
        slug: cat.slug ?? '',
        name: desc?.name || '',
        status: cat.status ?? true,
        sortOrder: cat.sortOrder ?? 0,
        children: [],
      };
      map.set(cat.id, item);
    }

    for (const item of map.values()) {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children.push(item);
      } else {
        roots.push(item);
      }
    }

    return roots;
  },

  /**
   * 按 ID 查找分类
   * pre: 分类存在
   */
  async findById(id: number) {
    const [row] = await db.select()
      .from(categories)
      .leftJoin(categoryDescriptions, eq(categories.id, categoryDescriptions.categoryId))
      .where(eq(categories.id, id))
      .limit(1);

    if (!row) throw new NotFoundError('分类', id);
    return row;
  },

  /**
   * 更新分类
   * pre: 分类存在、parentId 不能指向自身或子孙
   */
  async update(id: number, input: Partial<CreateCategoryInput>) {
    // pre: 分类存在
    await CategoryService.findById(id);

    // pre: parentId 不能指向自身
    if (input.parentId === id) {
      throw new BusinessRuleError('父分类不能指向自身');
    }

    // pre: parentId 不能指向子孙（防循环引用）
    if (input.parentId !== undefined && input.parentId !== null) {
      const descendants = await CategoryService.getDescendantIds(id);
      if (descendants.includes(input.parentId)) {
        throw new BusinessRuleError('父分类不能指向子孙节点');
      }

      // pre: 层级深度检查
      const depth = await CategoryService.getDepth(input.parentId);
      if (depth + 1 > MAX_DEPTH) {
        throw new BusinessRuleError(`分类层级不能超过 ${MAX_DEPTH} 级`);
      }
    }

    // 更新分类基本信息
    if (input.parentId !== undefined || input.status !== undefined || input.slug !== undefined || input.sortOrder !== undefined) {
      const updateData: Record<string, unknown> = {};
      if (input.parentId !== undefined) updateData.parentId = input.parentId;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;

      if (Object.keys(updateData).length > 0) {
        await db.update(categories)
          .set(updateData)
          .where(eq(categories.id, id));
      }
    }

    // 更新多语言描述
    if (input.descriptions) {
      for (const [locale, desc] of Object.entries(input.descriptions)) {
        await db.update(categoryDescriptions)
          .set({ name: desc.name, description: desc.description || null })
          .where(and(
            eq(categoryDescriptions.categoryId, id),
            eq(categoryDescriptions.locale, locale)
          ));
      }
    }

    // 如 parentId 变更，重建路径
    if (input.parentId !== undefined) {
      await CategoryService.rebuildPaths(id, input.parentId);
    }

    return { id };
  },

  /**
   * 删除分类
   * pre: 分类存在、无子分类、无关联产品
   */
  async delete(id: number) {
    // pre-1: 分类存在
    await CategoryService.findById(id);

    // pre-2: 无子分类
    const [child] = await db.select({ id: categories.id })
      .from(categories)
      .where(eq(categories.parentId, id))
      .limit(1);
    if (child) {
      throw new BusinessRuleError('该分类下有子分类，无法删除');
    }

    // pre-3: 无关联产品
    const [product] = await db.select({ id: productCategories.productId })
      .from(productCategories)
      .where(eq(productCategories.categoryId, id))
      .limit(1);
    if (product) {
      throw new BusinessRuleError('该分类下有产品，无法删除');
    }

    // 删除关联数据（paths、descriptions 由 cascade 处理）
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  },

  // ── 内部辅助方法 ──────────────────────────────────────────────

  /** 获取节点深度（从根到该节点的层级数） */
  async getDepth(id: number): Promise<number> {
    const paths = await db.select({ level: categoryPaths.level })
      .from(categoryPaths)
      .where(eq(categoryPaths.categoryId, id));
    if (paths.length === 0) return 0;
    return Math.max(...paths.map(p => p.level));
  },

  /** 获取所有子孙节点 ID */
  async getDescendantIds(id: number): Promise<number[]> {
    const rows = await db.select({ categoryId: categoryPaths.categoryId })
      .from(categoryPaths)
      .where(and(
        eq(categoryPaths.pathId, id),
        sql`${categoryPaths.level} > 0`
      ));
    return rows.map(r => r.categoryId);
  },

  /** 重建 CategoryPath（该节点到根的路径） */
  async rebuildPaths(categoryId: number, parentId: number | null) {
    // 清除旧路径
    await db.delete(categoryPaths).where(eq(categoryPaths.categoryId, categoryId));

    // 自身
    await db.insert(categoryPaths).values({ categoryId, pathId: categoryId, level: 0 });

    // 继承父节点的路径
    if (parentId !== null && parentId !== undefined) {
      const parentPaths = await db.select()
        .from(categoryPaths)
        .where(eq(categoryPaths.categoryId, parentId));

      for (const pp of parentPaths) {
        await db.insert(categoryPaths).values({
          categoryId,
          pathId: pp.pathId,
          level: pp.level + 1,
        });
      }
    }
  },
};

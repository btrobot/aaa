import { db } from '@/lib/db/db';
import { categories, categoryDescriptions } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface CreateCategoryInput {
  parentId: number | null;
  status: boolean;
  descriptions: {
    zh_cn: { name: string; description?: string };
    en: { name: string; description?: string };
  };
}

export interface CategoryTreeItem {
  id: number;
  parentId: number | null;
  name: string;
  status: boolean;
  children: CategoryTreeItem[];
}

export const CategoryService = {
  async create(input: CreateCategoryInput) {
    const [category] = await db.insert(categories).values({
      parentId: input.parentId,
      status: input.status,
    }).returning();

    for (const [locale, desc] of Object.entries(input.descriptions)) {
      await db.insert(categoryDescriptions).values({
        categoryId: category.id,
        locale,
        name: desc.name,
        description: desc.description || null,
      });
    }

    return category;
  },

  async getTree(locale: string = 'zh_cn'): Promise<CategoryTreeItem[]> {
    const rows = await db.select()
      .from(categories)
      .leftJoin(categoryDescriptions, eq(categories.id, categoryDescriptions.categoryId))
      .where(eq(categoryDescriptions.locale, locale))
      .orderBy(categories.sortOrder);

    const map = new Map<number, CategoryTreeItem>();
    const roots: CategoryTreeItem[] = [];

    for (const row of rows) {
      const cat = row.categories;
      const desc = row.category_descriptions;
      const item: CategoryTreeItem = {
        id: cat.id,
        parentId: cat.parentId,
        name: desc?.name || '',
        status: cat.status ?? true,
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

  async findById(id: number) {
    const [row] = await db.select()
      .from(categories)
      .leftJoin(categoryDescriptions, eq(categories.id, categoryDescriptions.categoryId))
      .where(eq(categories.id, id));
    return row || null;
  },

  async update(id: number, input: Partial<CreateCategoryInput>) {
    if (input.parentId !== undefined || input.status !== undefined) {
      await db.update(categories)
        .set({
          ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
          ...(input.status !== undefined ? { status: input.status } : {}),
        })
        .where(eq(categories.id, id));
    }

    if (input.descriptions) {
      for (const [locale, desc] of Object.entries(input.descriptions)) {
        await db.update(categoryDescriptions)
          .set({ name: desc.name, description: desc.description || null })
          .where(
            and(
              eq(categoryDescriptions.categoryId, id),
              eq(categoryDescriptions.locale, locale)
            )
          );
      }
    }

    return { id };
  },

  async delete(id: number) {
    // 删除分类（软删除：标记为不活跃）
    await db.update(categories)
      .set({ status: false })
      .where(eq(categories.id, id));
    return true;
  },
};
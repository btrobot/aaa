import { db } from '@/lib/db/db';
import { pages, pageDescriptions, pageCategories, pageCategoryDescriptions } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { z } from 'zod';
import { NotFoundError, BusinessRuleError } from './errors';

const pageDescSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});


export const createPageSchema = z.object({
  author: z.string().optional(),
  image: z.string().optional(),
  status: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
  descriptions: z.record(z.string(), pageDescSchema),
});

export const updatePageSchema = createPageSchema.partial();

export class PageService {
  async search(params: {
    locale?: string;
    status?: boolean;
    page?: number;
    pageSize?: number;
  } = {}) {
    const { locale = 'zh_cn', status, page = 1, pageSize = 12 } = params;
    const conditions = [];
    if (status !== undefined) conditions.push(eq(pages.status, status));

    const rows = await db.select()
      .from(pages)
      .leftJoin(pageDescriptions, and(
        eq(pages.id, pageDescriptions.pageId),
        eq(pageDescriptions.locale, locale),
      ))
      .where(and(...conditions))
      .orderBy(desc(pages.sortOrder), desc(pages.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return rows.map((row) => ({
      id: row.pages.id,
      author: row.pages.author,
      image: row.pages.image,
      status: row.pages.status,
      sortOrder: row.pages.sortOrder,
      createdAt: row.pages.createdAt,
      updatedAt: row.pages.updatedAt,
      title: row.page_descriptions?.title || null,
      content: row.page_descriptions?.content || null,
      metaTitle: row.page_descriptions?.metaTitle || null,
      metaDescription: row.page_descriptions?.metaDescription || null,
      metaKeywords: row.page_descriptions?.metaKeywords || null,
    }));
  }

  async getById(id: number, locale: string = 'zh_cn') {
    const rows = await db.select()
      .from(pages)
      .leftJoin(pageDescriptions, and(
        eq(pages.id, pageDescriptions.pageId),
        eq(pageDescriptions.locale, locale),
      ))
      .where(eq(pages.id, id))
      .limit(1);

    if (rows.length === 0) throw new NotFoundError('文章', id);
    const row = rows[0];
    return {
      id: row.pages.id,
      author: row.pages.author,
      image: row.pages.image,
      status: row.pages.status,
      sortOrder: row.pages.sortOrder,
      createdAt: row.pages.createdAt,
      updatedAt: row.pages.updatedAt,
      title: row.page_descriptions?.title || null,
      content: row.page_descriptions?.content || null,
      metaTitle: row.page_descriptions?.metaTitle || null,
      metaDescription: row.page_descriptions?.metaDescription || null,
      metaKeywords: row.page_descriptions?.metaKeywords || null,
    };
  }

  async create(data: z.infer<typeof createPageSchema>) {
    const validated = createPageSchema.parse(data);

    const [page] = await db.insert(pages).values({
      author: validated.author,
      image: validated.image,
      status: validated.status,
      sortOrder: validated.sortOrder,
    }).returning();

    if (validated.descriptions) {
      for (const [locale, desc] of Object.entries(validated.descriptions)) {
        await db.insert(pageDescriptions).values({
          pageId: page.id,
          locale,
          title: desc.title,
          content: desc.content || null,
          metaTitle: desc.metaTitle || null,
          metaDescription: desc.metaDescription || null,
          metaKeywords: desc.metaKeywords || null,
        });
      }
    }
    return page;
  }

  async update(id: number, data: z.infer<typeof updatePageSchema>) {
    // pre: 文章存在
    await this.getById(id);

    const validated = updatePageSchema.parse(data);
    const updateData: { author?: string; image?: string; status?: boolean; sortOrder?: number } = {};
    if (validated.author !== undefined) updateData.author = validated.author;
    if (validated.image !== undefined) updateData.image = validated.image;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.sortOrder !== undefined) updateData.sortOrder = validated.sortOrder;

    if (Object.keys(updateData).length > 0) {
      await db.update(pages).set(updateData).where(eq(pages.id, id));
    }

    if (validated.descriptions) {
      for (const [locale, desc] of Object.entries(validated.descriptions)) {
        const existing = await db.select()
          .from(pageDescriptions)
          .where(and(eq(pageDescriptions.pageId, id), eq(pageDescriptions.locale, locale)))
          .limit(1);

        if (existing.length > 0) {
          await db.update(pageDescriptions)
            .set({
              title: desc.title,
              content: desc.content || null,
              metaTitle: desc.metaTitle || null,
              metaDescription: desc.metaDescription || null,
              metaKeywords: desc.metaKeywords || null,
            })
            .where(and(eq(pageDescriptions.pageId, id), eq(pageDescriptions.locale, locale)));
        } else {
          await db.insert(pageDescriptions).values({
            pageId: id,
            locale,
            title: desc.title,
            content: desc.content || null,
            metaTitle: desc.metaTitle || null,
            metaDescription: desc.metaDescription || null,
            metaKeywords: desc.metaKeywords || null,
          });
        }
      }
    }
    return this.getById(id);
  }

  async delete(id: number) {
    // pre: 文章存在
    await this.getById(id);
    await db.delete(pageDescriptions).where(eq(pageDescriptions.pageId, id));
    await db.delete(pages).where(eq(pages.id, id));
    return true;
  }

  // ─── Page Categories ─────────────────────────────────────────────

  async listCategories(locale: string = 'zh_cn') {
    const rows = await db.select()
      .from(pageCategories)
      .leftJoin(pageCategoryDescriptions, and(
        eq(pageCategories.id, pageCategoryDescriptions.pageCategoryId),
        eq(pageCategoryDescriptions.locale, locale),
      ))
      .orderBy(pageCategories.sortOrder);

    return rows.map((row) => ({
      id: row.page_categories.id,
      parentId: row.page_categories.parentId,
      image: row.page_categories.image,
      sortOrder: row.page_categories.sortOrder,
      status: row.page_categories.status,
      name: row.page_category_descriptions?.name || null,
      description: row.page_category_descriptions?.description || null,
    }));
  }
}

export const pageService = new PageService();
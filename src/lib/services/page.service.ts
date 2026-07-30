import { db } from '@/lib/db/db';
import { pages, pageDescriptions } from '@/lib/db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';
import { z } from 'zod';

const localeMap: Record<string, string> = { zh: 'zh_cn', en: 'en' };

const pageDescSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type PageDesc = z.infer<typeof pageDescSchema>;

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

    if (rows.length === 0) return null;
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
      summary: row.page_descriptions?.metaDescription || null,
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
        const d = desc as PageDesc;
        await db.insert(pageDescriptions).values({
          pageId: page.id,
          locale,
          title: d.title,
          content: d.content || null,
          metaTitle: d.metaTitle || null,
          metaDescription: d.metaDescription || null,
          metaKeywords: d.metaKeywords || null,
        });
      }
    }
    return page;
  }

  async update(id: number, data: z.infer<typeof updatePageSchema>) {
    const validated = updatePageSchema.parse(data);
    const updateData: Record<string, any> = {};
    if (validated.author !== undefined) updateData.author = validated.author;
    if (validated.image !== undefined) updateData.image = validated.image;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.sortOrder !== undefined) updateData.sortOrder = validated.sortOrder;

    if (Object.keys(updateData).length > 0) {
      await db.update(pages)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(pages.id, id));
    }

    if (validated.descriptions) {
      for (const [locale, desc] of Object.entries(validated.descriptions)) {
        const d = desc as PageDesc;
        const existing = await db.select()
          .from(pageDescriptions)
          .where(and(eq(pageDescriptions.pageId, id), eq(pageDescriptions.locale, locale)))
          .limit(1);

        if (existing.length > 0) {
          await db.update(pageDescriptions)
            .set({
              title: d.title,
              content: d.content || null,
              metaTitle: d.metaTitle || null,
              metaDescription: d.metaDescription || null,
              metaKeywords: d.metaKeywords || null,
            })
            .where(and(eq(pageDescriptions.pageId, id), eq(pageDescriptions.locale, locale)));
        } else {
          await db.insert(pageDescriptions).values({
            pageId: id,
            locale,
            title: d.title,
            content: d.content || null,
            metaTitle: d.metaTitle || null,
            metaDescription: d.metaDescription || null,
            metaKeywords: d.metaKeywords || null,
          });
        }
      }
    }
    return this.getById(id);
  }

  async delete(id: number) {
    await db.delete(pageDescriptions).where(eq(pageDescriptions.pageId, id));
    await db.delete(pages).where(eq(pages.id, id));
  }
}

export const pageService = new PageService();
import { MetadataRoute } from 'next';
import { db } from '@/lib/db/db';
import { products, productDescriptions, categories, categoryDescriptions, pages, pageDescriptions, brands, currencies } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';

const BASE_URL = process.env.COZE_PROJECT_DOMAIN_DEFAULT || 'https://nodecoda.com';
const LOCALES = ['zh', 'en'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  // 1. 静态页面
  const staticPages = ['', '/products', '/brands', '/news', '/cart'];
  for (const locale of LOCALES) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }
  }

  // 2. 产品详情页
  const productRows = await db
    .select({
      id: products.id,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .where(eq(products.status, true))
    .limit(1000);

  for (const locale of LOCALES) {
    for (const p of productRows) {
      entries.push({
        url: `${BASE_URL}/${locale}/products/${p.id}`,
        lastModified: p.updatedAt || new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      });
    }
  }

  // 3. 分类页
  const categoryRows = await db
    .select({ id: categories.id })
    .from(categories);

  for (const locale of LOCALES) {
    for (const c of categoryRows) {
      entries.push({
        url: `${BASE_URL}/${locale}/categories/${c.id}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
  }

  // 4. 品牌页
  const brandRows = await db
    .select({ id: brands.id })
    .from(brands);

  for (const locale of LOCALES) {
    for (const b of brandRows) {
      entries.push({
        url: `${BASE_URL}/${locale}/brands/${b.id}`,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  // 5. 文章页
  const pageRows = await db
    .select({ id: pages.id, updatedAt: pages.updatedAt })
    .from(pages)
    .where(eq(pages.status, true))
    .limit(500);

  for (const locale of LOCALES) {
    for (const p of pageRows) {
      entries.push({
        url: `${BASE_URL}/${locale}/news/${p.id}`,
        lastModified: p.updatedAt || new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  }

  return entries;
}
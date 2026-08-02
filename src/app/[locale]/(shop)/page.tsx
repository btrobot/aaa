import { ProductService } from '@/lib/services/product.service';
import { CategoryService } from '@/lib/services/category.service';
import { db } from '@/lib/db/db';
import { productImages } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { HomePageClient } from './home-page-client';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const apiLocale = locale === 'en' ? 'en' : 'zh_cn';

  const [rawProducts, categories] = await Promise.all([
    ProductService.search({ locale: apiLocale, pageSize: 8, page: 1, sortBy: 'sortOrder', sortOrder: 'desc' }),
    CategoryService.search({ locale: apiLocale }),
  ]);

  // Fetch images for the products
  const productIds = rawProducts.map(p => p.id);
  const images = productIds.length > 0
    ? await db.select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(productImages.sortOrder)
    : [];

  // Attach images to products (map to the shape HomePageClient expects)
  const products = rawProducts.map(p => ({
    id: p.id,
    price: p.price,
    sales: p.sales,
    quantity: p.quantity,
    description: p.description ? { name: p.description.name } as { name: string } : undefined,
    images: images.filter(i => i.productId === p.id).map(i => ({ url: i.image, sortOrder: i.sortOrder ?? 0 })),
    brand: p.brand,
  }));

  return <HomePageClient products={products} categories={categories} locale={locale} />;
}
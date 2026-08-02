import { Suspense } from 'react';
import { ProductService } from '@/lib/services/product.service';
import { CategoryService } from '@/lib/services/category.service';
import { db } from '@/lib/db/db';
import { productImages } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { HomePageClient } from './home-page-client';
import { Skeleton } from '@/components/ui/skeleton';

async function FeaturedProducts({ locale, apiLocale }: { locale: string; apiLocale: string }) {
  const [rawProducts, categories] = await Promise.all([
    ProductService.search({ locale: apiLocale, pageSize: 8, page: 1, sortBy: 'sortOrder', sortOrder: 'desc' }),
    CategoryService.search({ locale: apiLocale }),
  ]);

  const productIds = rawProducts.map(p => p.id);
  const images = productIds.length > 0
    ? await db.select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(productImages.sortOrder)
    : [];

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

function HomePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const apiLocale = locale === 'en' ? 'en' : 'zh_cn';

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <FeaturedProducts locale={locale} apiLocale={apiLocale} />
    </Suspense>
  );
}
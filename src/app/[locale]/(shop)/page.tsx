import { Suspense } from 'react';
import { ProductService } from '@/lib/services/product.service';
import { BrandService } from '@/lib/services/brand.service';
import { PageService } from '@/lib/services/page.service';
import { Skeleton } from '@/components/ui/skeleton';
import HomePageClient from './home-page-client';

async function HomePageContent({ locale }: { locale: string }) {
  const apiLocale = locale === 'en' ? 'en' : 'zh_cn';

  const [rawProducts, brandResult, newsResult] = await Promise.all([
    ProductService.search({ locale: apiLocale, pageSize: 8, page: 1, sortBy: 'sortOrder', sortOrder: 'desc' }),
    BrandService.findAll({}),
    PageService.search({ locale: apiLocale, pageSize: 3, page: 1 }),
  ]);

  const brands = brandResult.items.map(b => ({
    id: b.id,
    name: b.name,
    logo: b.logo,
    description: b.description,
    website: b.website,
    sortOrder: b.sortOrder,
    status: b.status,
  }));

  const products = rawProducts.map(p => ({
    id: p.id,
    sku: p.sku,
    price: p.price,
    sales: p.sales,
    quantity: p.quantity,
    sortOrder: p.sortOrder,
    status: p.status,
    brandId: p.brandId,
    costPrice: p.costPrice,
    weight: p.weight,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    description: p.description ? { name: p.description.name } as { name: string } : null,
    descriptions: [],
    images: [],
    categoryIds: [],
    brand: p.brand,
  }));

  const news = newsResult.items.map(n => ({
    id: n.id,
    title: n.title,
    content: n.content,
    image: n.image,
    author: n.author,
    status: n.status,
    sortOrder: n.sortOrder,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  }));

  return (
    <HomePageClient
      initialProducts={products as any}
      initialBrands={brands as any}
      initialNews={news as any}
      locale={locale}
    />
  );
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

  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent locale={locale} />
    </Suspense>
  );
}
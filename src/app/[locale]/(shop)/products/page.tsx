'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/lib/api';
import type { Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';
import { Search, SlidersHorizontal, Grid3X3, List, Mail, Ruler, Weight, Package } from 'lucide-react';
import Breadcrumb from '@/components/Breadcrumb';
import { toApiLocale } from '@/lib/locales';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { SkeletonGrid } from '@/components/SkeletonGrid';
import { ProductCard } from '@/components/ProductCard';
import { InquiryModal } from '@/components/InquiryModal';

const SORT_OPTIONS = [
  { value: 'newest', labelKey: 'sortNewest' },
  { value: 'price_asc', labelKey: 'sortPriceAsc' },
  { value: 'price_desc', labelKey: 'sortPriceDesc' },
  { value: 'popular', labelKey: 'sortPopular' },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]['value'];

export default function ProductsPage() {
  const t = useTranslations('products');
  const locale = useLocale();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inquiryProduct, setInquiryProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          pageSize: 50,
          locale: toApiLocale(locale),
        };
        if (searchQuery) params.search = searchQuery;
        if (sortBy === 'price_asc') params.sortBy = 'price_asc';
        else if (sortBy === 'price_desc') params.sortBy = 'price_desc';
        else if (sortBy === 'popular') params.sortBy = 'sales';
        else params.sortBy = 'newest';

        const result = await api.products.list(params);
        setProducts(result.items || []);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [locale, searchQuery, sortBy]);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.sku?.toLowerCase().includes(q) ||
        p.description?.name?.toLowerCase().includes(q) ||
        p.brand?.name?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('title')}
          description={t('description')}
        >
          <Breadcrumb
            items={[{ label: t('title'), href: `/${locale}/products` }]}
          />
        </PageHeader>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[160px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('sortBy')} />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900">{t('noResults')}</h3>
            <p className="mt-1 text-sm text-gray-500">{t('noResultsDesc')}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => { setSearchQuery(''); setSortBy('newest'); }}
            >
              {t('clearFilters')}
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-4'
            }
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>

      <InquiryModal
        open={!!inquiryProduct}
        onOpenChange={(open) => { if (!open) setInquiryProduct(null); }}
        productId={inquiryProduct ? inquiryProduct.id : 0}
        productName={inquiryProduct?.description?.name ?? ''}
        productSku={inquiryProduct ? inquiryProduct.sku : ''}
      />
    </PageLayout>
  );
}
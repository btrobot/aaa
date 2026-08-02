'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/lib/api';
import type { CategoryTreeNode } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/PageLayout';
import { PageHeader } from '@/components/PageHeader';
import { CategoryCard } from '@/components/CategoryCard';
import { toApiLocale } from '@/lib/locales';

export default function CategoriesPage() {
  const t = useTranslations('categories');
  const locale = useLocale();

  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await api.categories.list(toApiLocale(locale));
        setCategories(result || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [locale]);

  return (
    <PageLayout>
      <div className="space-y-6">
        <PageHeader
          title={t('title')}
          description={t('description')}
        />

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500">{t('noCategories')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
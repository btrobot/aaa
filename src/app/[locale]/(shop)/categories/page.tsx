'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { categories } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';

export default function CategoriesPage() {
  const { locale, t } = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('products.categories')}</h1>
        <p className="text-gray-500 mb-8">{t('home.categoriesDesc')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${locale}/products?category=${cat.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <span className="text-5xl block mb-4 group-hover:scale-110 transition-transform">{cat.icon}</span>
                  <h3 className="font-semibold text-gray-900 text-lg">{locale === 'zh' ? cat.name : cat.nameEn}</h3>
                  <p className="text-sm text-gray-400 mt-1">{cat.count} {t('products.products')}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
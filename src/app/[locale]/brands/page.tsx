'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { brands } from '@/lib/mock-data';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function BrandsPage() {
  const { locale, t } = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('brands.title')}</h1>
        <p className="text-gray-500 mb-8">{t('brands.description')}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/${locale}/products?brand=${brand.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                    <span className="text-2xl font-bold text-gray-400 group-hover:text-orange-500">{brand.name.charAt(0)}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{brand.name}</h3>
                  <Badge variant="outline" className="mt-2 text-gray-400 border-gray-200">
                    {brand.productCount} {t('products.products')}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
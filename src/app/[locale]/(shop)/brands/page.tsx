'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { Building2, ChevronRight } from 'lucide-react';
import type { BrandData } from '@/lib/types';

export default function BrandsPage() {
  const { locale, t } = useTranslations();
  
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.brands.list();
        setBrands(data);
      } catch (err) {
        console.error('Failed to load brands:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('nav.brands')}</h1>
        <p className="text-gray-500 mb-8">{t('home.brandsDesc')}</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/${locale}/products?brand=${brand.id}`}
                className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{brand.name}</h3>
                    {brand.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{brand.description}</p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium">
                      <span>{t('home.viewProducts')}</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
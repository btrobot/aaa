'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import { Cog } from 'lucide-react';

function toApiLocale(locale: string) {
  return locale === 'en' ? 'en' : 'zh_cn';
}

export default function CategoriesPage() {
  const { locale, t } = useTranslations();
  
interface CategoryData {
  id: number;
  name: string;
  children?: { id: number }[];
}

const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cats = await api.categories.list(toApiLocale(locale));
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [locale]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('nav.categories')}</h1>
        <p className="text-gray-500 mb-8">{t('home.categoriesDesc')}</p>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/products?category=${cat.id}`}
                className="group bg-white rounded-xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-center"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 transition-colors">
                  <Cog className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
                {cat.children && cat.children.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1">{cat.children.length} 个子分类</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
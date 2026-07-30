'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import type { Page } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ChevronRight, Newspaper } from 'lucide-react';

function toApiLocale(locale: string) {
  return locale === 'en' ? 'en' : 'zh_cn';
}

export default function NewsPage() {
  const { locale, t } = useTranslations();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPages();
  }, [locale]);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.pages.list({ status: true, locale: toApiLocale(locale) });
      setPages(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-200 rounded w-48 mx-auto" />
            <div className="h-5 bg-gray-200 rounded w-72 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadPages}>{t('common.retry') || '重试'}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t('news.title')}</h1>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">{t('news.desc')}</p>
        </div>
      </div>

      {/* News List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {pages.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('news.noNews')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Link key={page.id} href={`/${locale}/news/${page.id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(page.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {page.title || '无标题'}
                    </h3>
                    {page.summary && (
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">{page.summary}</p>
                    )}
                    <div className="flex items-center text-blue-600 text-sm font-medium group-hover:gap-2 transition-all">
                      <span>{t('news.readMore')}</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
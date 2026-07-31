'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import type { Page } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowLeft, User, Newspaper } from 'lucide-react';

export default function NewsDetailPage() {
  const { locale, t } = useTranslations();
  const params = useParams();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadPage(Number(params.id));
    }
  }, [params.id, locale]);

  const loadPage = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.pages.getById(id);
      setPage(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-48" />
            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Newspaper className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-4">{error || '文章不存在'}</p>
          <Link href={`/${locale}/news`}>
            <Button variant="outline">{t('news.backToNews')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href={`/${locale}/news`}
          className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('news.backToNews')}
        </Link>

        {/* Article Header */}
        <article>
          <header className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {page.title || '无标题'}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(page.createdAt).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
              </span>
              {page.authorId && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {t('news.author')}
                </span>
              )}
            </div>
          </header>

          {/* Article Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
            {page.summary && (
              <p className="text-lg text-gray-600 mb-6 font-medium leading-relaxed">
                {page.summary}
              </p>
            )}
            {page.content ? (
              <div className="prose prose-gray max-w-none">
                {(page.content as string).split('\n').map((paragraph: string, i: number) => (
                  paragraph.trim() ? (
                    <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
                  ) : null
                ))}
              </div>
            ) : (
              <p className="text-gray-400 italic">{t('common.noContent') || '暂无内容'}</p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
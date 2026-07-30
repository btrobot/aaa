'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Newspaper, TrendingUp } from 'lucide-react';

interface NewsItem {
  id: string;
  titleKey: string;
  descKey: string;
  image: string;
  date: string;
  category: 'company' | 'industry';
}

const newsItems: NewsItem[] = [
  {
    id: 'news1',
    titleKey: 'news.news1Title',
    descKey: 'news.news1Desc',
    image: 'https://images.unsplash.com/photo-1561ae3c4e3c3e3c4e3c3e3c4e?w=600&q=80',
    date: '2024-12-15',
    category: 'company',
  },
  {
    id: 'news2',
    titleKey: 'news.news2Title',
    descKey: 'news.news2Desc',
    image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e4b5c?w=600&q=80',
    date: '2024-11-28',
    category: 'company',
  },
  {
    id: 'news3',
    titleKey: 'news.news3Title',
    descKey: 'news.news3Desc',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    date: '2024-10-20',
    category: 'industry',
  },
  {
    id: 'news4',
    titleKey: 'news.news4Title',
    descKey: 'news.news4Desc',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80',
    date: '2024-09-10',
    category: 'company',
  },
  {
    id: 'news5',
    titleKey: 'news.news5Title',
    descKey: 'news.news5Desc',
    image: 'https://images.unsplash.com/photo-1570488344390-4c9e3c0c1e3e?w=600&q=80',
    date: '2024-08-05',
    category: 'company',
  },
  {
    id: 'news6',
    titleKey: 'news.news6Title',
    descKey: 'news.news6Desc',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
    date: '2024-07-18',
    category: 'industry',
  },
];

export default function NewsPage() {
  const { locale, t } = useTranslations();
  const [activeTab, setActiveTab] = useState<'all' | 'company' | 'industry'>('all');

  const filteredNews = activeTab === 'all'
    ? newsItems
    : newsItems.filter((item) => item.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('news.title')}</h1>
          <p className="text-blue-100 text-lg">{t('news.subtitle')}</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Tab Filter */}
        <div className="flex gap-3 mb-10">
          {(['all', 'company', 'industry'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
            >
              {tab === 'all'
                ? (locale === 'zh' ? '全部' : 'All')
                : tab === 'company'
                ? t('news.companyNews')
                : t('news.industryNews')}
            </button>
          ))}
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-gray-900">{t('news.noNews')}</h3>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((item) => (
              <Card key={item.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={t(item.titleKey)}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={
                      item.category === 'company'
                        ? 'bg-blue-600/90 text-white border-0'
                        : 'bg-green-600/90 text-white border-0'
                    }>
                      {item.category === 'company' ? t('news.companyNews') : t('news.industryNews')}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{item.date}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {t(item.descKey)}
                  </p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto text-sm">
                    {t('news.readMore')}
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
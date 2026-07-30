'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { products, categories } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Star, ShoppingCart, Truck, Shield, HeadphonesIcon, Gift } from 'lucide-react';

export default function HomePage() {
  const { locale, t } = useTranslations();
  const featured = products.filter((p) => p.isNew || p.isSale).slice(0, 8);
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredProducts = activeCategory === 'all'
    ? featured
    : featured.filter((p) => p.category === activeCategory);

  const features = [
    { icon: Shield, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: Truck, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: Gift, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
    { icon: HeadphonesIcon, title: t('home.feature4Title'), desc: t('home.feature4Desc') },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <Badge className="bg-white/20 text-white border-0 mb-4 text-sm px-4 py-1.5">限时特惠 · 全场低至5折</Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-base px-8 h-12 font-semibold">
                  {t('home.heroCta')}
                </Button>
              </Link>
              <Link href={`/${locale}/categories`}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-base px-8 h-12">
                  {t('home.heroCta2')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.categories')}</h2>
            <p className="mt-2 text-gray-500">{t('home.categoriesDesc')}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/products?category=${cat.id}`}
                className="group flex flex-col items-center p-4 bg-white rounded-xl border hover:border-orange-200 hover:shadow-md transition-all"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600">{locale === 'zh' ? cat.name : cat.nameEn}</span>
                <span className="text-xs text-gray-400 mt-1">{cat.count} 件</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('home.featuredProducts')}</h2>
              <p className="mt-1 text-gray-500">{t('home.featuredProductsDesc')}</p>
            </div>
            <Link
              href={`/${locale}/products`}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              {t('common.viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['all', ...new Set(featured.map((p) => p.category))].map((cat) => {
              const catName = cat === 'all' ? t('products.title') : categories.find((c) => c.id === cat)?.name;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm rounded-full transition-colors ${
                    activeCategory === cat
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/${locale}/products/${product.id}`} className="group">
                <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.isNew && <Badge className="absolute top-2 left-2 bg-blue-500 text-white border-0">新品</Badge>}
                    {product.isSale && <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0">促销</Badge>}
                  </div>
                  <CardContent className="p-3 sm:p-4">
                    <p className="text-xs text-gray-500 mb-1">{product.brandName}</p>
                    <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-500">{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-orange-600">¥{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">¥{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Mobile View All */}
          <div className="mt-8 text-center sm:hidden">
            <Link href={`/${locale}/products`}>
              <Button variant="outline" className="w-full">
                {t('common.viewAll')} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Deals Section */}
      <section className="py-16 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-orange-100">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-red-500 text-white border-0">限时特惠</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">全场满减优惠</h3>
              <p className="text-gray-500 mb-6">满 ¥500 减 ¥50 | 满 ¥1000 减 ¥150 | 满 ¥3000 减 ¥500</p>
              <Link href={`/${locale}/products`}>
                <Button className="bg-orange-500 hover:bg-orange-600">立即抢购</Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">新用户专享</h3>
              <p className="text-white/80 mb-6">首单立减 ¥100</p>
              <Link href={`/${locale}/auth/register`}>
                <Button className="bg-white text-orange-600 hover:bg-gray-100">立即注册</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
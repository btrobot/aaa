'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { api } from '@/lib/api';
import type { Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Shield, Truck, Gift, HeadphonesIcon, Star, Ruler, Cog } from 'lucide-react';

function toApiLocale(locale: string) {
  return locale === 'en' ? 'en' : 'zh_cn';
}

export default function HomePage() {
  const { locale, t } = useTranslations();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prods, cats] = await Promise.all([
          api.products.list({ locale: toApiLocale(locale), pageSize: 8 }),
          api.categories.list(toApiLocale(locale)),
        ]);
        setProducts(prods);
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [locale]);

  const features = [
    { icon: Shield, title: t('home.feature1Title'), desc: t('home.feature1Desc') },
    { icon: Truck, title: t('home.feature2Title'), desc: t('home.feature2Desc') },
    { icon: Gift, title: t('home.feature3Title'), desc: t('home.feature3Desc') },
    { icon: HeadphonesIcon, title: t('home.feature4Title'), desc: t('home.feature4Desc') },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <Badge className="bg-blue-500/30 text-blue-100 border-0 mb-4 text-sm px-4 py-1.5">
              {t('home.deals')}
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-blue-100/80 mb-8 max-w-xl">
              {t('home.heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="bg-white text-blue-700 hover:bg-gray-100 text-base px-8 h-12 font-semibold">
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
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-blue-600" />
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/products?category=${cat.id}`}
                className="group flex flex-col items-center p-6 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <Cog className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{cat.name}</span>
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
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {t('common.viewAll')} <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-sm">
                  <div className="aspect-square bg-gray-100 animate-pulse" />
                  <CardContent className="p-3 sm:p-4 space-y-2">
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-2/3" />
                    <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => {
                const desc = product.description;
                const name = desc?.name || `Product #${product.id}`;
                return (
                  <Link key={product.id} href={`/${locale}/products/${product.id}`} className="group">
                    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300">
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].image}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Cog className="w-16 h-16" />
                          </div>
                        )}
                        {product.sales > 0 && (
                          <Badge className="absolute top-2 left-2 bg-blue-500 text-white border-0">
                            已售 {product.sales}
                          </Badge>
                        )}
                      </div>
                      <CardContent className="p-3 sm:p-4">
                        {product.brand && (
                          <p className="text-xs text-gray-500 mb-1">{product.brand.name}</p>
                        )}
                        <h3 className="font-medium text-sm sm:text-base text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                          {name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-blue-600">
                            ¥{Number(product.price).toLocaleString()}
                          </span>
                          {product.quantity > 0 && (
                            <span className="text-xs text-gray-400">库存 {product.quantity}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

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
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-500 text-white border-0">{t('home.deals')}</Badge>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">批量采购优惠</h3>
              <p className="text-gray-500 mb-6">订购 5 台以上享 9 折 | 10 台以上享 8 折 | 50 台以上享定制方案</p>
              <Link href={`/${locale}/products`}>
                <Button className="bg-blue-600 hover:bg-blue-700">立即咨询</Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-2">新客户专享</h3>
              <p className="text-white/80 mb-6">首单免运费 + 免费安装调试</p>
              <Link href={`/${locale}/auth/register`}>
                <Button className="bg-white text-blue-600 hover:bg-gray-100">立即注册</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
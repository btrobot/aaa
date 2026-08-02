'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Shield, Ship, HeadphonesIcon, Building2, Newspaper, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { api, type Product, type Brand, type Page } from '@/lib/api';

interface HomePageClientProps {
  initialProducts: Product[];
  initialBrands: Brand[];
  initialNews: Page[];
  locale: string;
}

export default function HomePageClient({
  initialProducts,
  initialBrands,
  initialNews,
  locale,
}: HomePageClientProps) {
  const t = useTranslations();

  const [products] = useState<Product[]>(initialProducts);
  const [brands] = useState<Brand[]>(initialBrands);
  const [news] = useState<Page[]>(initialNews);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20">
              {t('home.heroBadge')}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl">
              {t('home.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold">
                  {t('home.exploreProducts')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href={`/${locale}/about`}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  {t('home.learnMore')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '200+', label: t('home.statProducts') },
              { value: '50+', label: t('home.statCountries') },
              { value: '1000+', label: t('home.statClients') },
              { value: '15+', label: t('home.statYears') },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className={`py-16 bg-gray-50 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('home.featuredProducts')}</h2>
              <p className="mt-2 text-gray-500">{t('home.featuredDesc')}</p>
            </div>
            <Link href={`/${locale}/products`}>
              <Button variant="outline" className="hidden sm:flex">
                {t('home.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <Link key={product.id} href={`/${locale}/products/${product.id}`}>
                <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-4xl opacity-30">🎢</div>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {product.description?.name || product.sku}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{product.sku}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-blue-600">
                        ¥{parseFloat(product.price).toLocaleString()}
                      </span>
                      {product.brand && (
                        <Badge variant="secondary" className="text-xs">
                          {product.brand.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.brands')}</h2>
            <p className="mt-2 text-gray-500">{t('home.brandsDesc')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.slice(0, 4).map((brand) => (
              <Link key={brand.id} href={`/${locale}/brands`}>
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-0 bg-gray-50 hover:bg-white group cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{brand.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{brand.description?.slice(0, 60)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t('home.featureQuality'), desc: t('home.featureQualityDesc') },
              { icon: Ship, title: t('home.featureShipping'), desc: t('home.featureShippingDesc') },
              { icon: HeadphonesIcon, title: t('home.featureSupport'), desc: t('home.featureSupportDesc') },
            ].map((feature) => (
              <Card key={feature.title} className="p-6 border-0 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{t('home.news')}</h2>
              <p className="mt-2 text-gray-500">{t('home.newsDesc')}</p>
            </div>
            <Link href={`/${locale}/news`}>
              <Button variant="outline" className="hidden sm:flex">
                {t('home.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/${locale}/news/${item.id}`}>
                <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-gray-400" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.content}</p>
                    <div className="flex items-center mt-4 text-sm text-blue-600 font-medium">
                      {t('home.readMore')}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Shield, Ship, HeadphonesIcon, Building2, Newspaper, ChevronRight, Star, Cog, Globe } from 'lucide-react';
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

function HeroSection({ locale, t }: { locale: string; t: (key: string) => string }) {
  return (
    <section className="relative overflow-hidden hero-gradient text-white">
      {/* Floating geometric elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        {/* Industrial structural lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 1440 800" preserveAspectRatio="none">
          <line x1="0" y1="200" x2="1440" y2="200" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="400" x2="1440" y2="400" stroke="white" strokeWidth="0.5" />
          <line x1="0" y1="600" x2="1440" y2="600" stroke="white" strokeWidth="0.5" />
          <line x1="360" y1="0" x2="360" y2="800" stroke="white" strokeWidth="0.5" />
          <line x1="720" y1="0" x2="720" y2="800" stroke="white" strokeWidth="0.5" />
          <line x1="1080" y1="0" x2="1080" y2="800" stroke="white" strokeWidth="0.5" />
        </svg>
        {/* Floating gear shapes */}
        <div className="absolute top-20 left-20 opacity-[0.04]">
          <svg width="120" height="120" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4"/><circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="1"/></svg>
        </div>
        <div className="absolute bottom-20 right-20 opacity-[0.03] animate-float">
          <svg width="80" height="80" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 4"/><circle cx="50" cy="50" r="25" fill="none" stroke="white" strokeWidth="1"/></svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 lg:py-44">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="max-w-xl">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm text-sm px-4 py-1.5">
              {t('home.heroBadge')}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-sky-100/80 mb-10 max-w-xl leading-relaxed">
              {t('home.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="bg-white text-slate-900 hover:bg-sky-50 font-semibold px-8 py-6 text-base shadow-lg shadow-black/10">
                  {t('home.exploreProducts')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={`/${locale}/about`}>
                <Button size="lg" variant="outline" className="border-white/25 text-white hover:bg-white/10 hover:text-white px-8 py-6 text-base">
                  {t('home.learnMore')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Product showcase area */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-96 h-96">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border border-white/10 animate-float" />
              {/* Inner decorative circles */}
              <div className="absolute inset-8 rounded-full border border-white/5" />
              <div className="absolute inset-16 rounded-full border border-white/5" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Cog className="w-24 h-24 text-white/15 mx-auto mb-4" />
                  <div className="flex gap-2 justify-center">
                    <Star className="w-4 h-4 text-sky-400/40" />
                    <Star className="w-5 h-5 text-sky-400/60" />
                    <Star className="w-4 h-4 text-sky-400/40" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsSection({ t }: { t: (key: string) => string }) {
  const stats = [
    { value: '200+', label: t('home.statProducts') },
    { value: '50+', label: t('home.statCountries') },
    { value: '1000+', label: t('home.statClients') },
    { value: '15+', label: t('home.statYears') },
  ];

  return (
    <section className="relative -mt-12 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-100 px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-100">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`text-center ${i > 0 ? 'pl-6' : ''}`}>
                <div className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1 font-sans">{stat.value}</div>
                <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
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
      <HeroSection locale={locale} t={t} />

      {/* Stats Section */}
      <StatsSection t={t} />

      {/* Products Section */}
      <section className={`py-20 bg-slate-50 transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge variant="secondary" className="mb-3 bg-sky-100 text-sky-700 border-0">
                {t('home.featuredProducts')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-sans">{t('home.featuredProducts')}</h2>
              <p className="mt-2 text-slate-400">{t('home.featuredDesc')}</p>
            </div>
            <Link href={`/${locale}/products`}>
              <Button variant="outline" className="hidden sm:inline-flex border-slate-200 text-slate-700 hover:bg-slate-50">
                {t('home.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, index) => (
              <Link key={product.id} href={`/${locale}/products/${product.id}`}>
                <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full bg-white"
                      style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cog className="h-16 w-16 text-slate-200 group-hover:scale-110 group-hover:rotate-90 transition-all duration-700" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/0 via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors duration-300 line-clamp-1">
                      {product.description?.name || product.sku}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{product.sku}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <span className="text-lg font-bold text-slate-900">
                        ¥{parseFloat(product.price).toLocaleString()}
                      </span>
                      {product.brand && (
                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-0">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-sky-100 text-sky-700 border-0">
              {t('home.brands')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-sans">{t('home.brands')}</h2>
            <p className="mt-2 text-slate-400">{t('home.brandsDesc')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.slice(0, 4).map((brand) => (
              <Link key={brand.id} href={`/${locale}/brands`}>
                <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border border-slate-100 bg-white hover:border-sky-100 group cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-sky-50 flex items-center justify-center group-hover:from-sky-50 group-hover:to-sky-100 transition-colors">
                    <Building2 className="h-8 w-8 text-slate-500 group-hover:text-sky-600 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">{brand.name}</h3>
                  <p className="text-sm text-slate-400 mt-1.5 line-clamp-2">{brand.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3 bg-sky-100 text-sky-700 border-0">
              {t('home.featureQuality')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-sans">{t('home.featureQuality')}</h2>
            <p className="mt-2 text-slate-400">{t('home.featureQualityDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t('home.featureQuality'), desc: t('home.featureQualityDesc') },
              { icon: Ship, title: t('home.featureShipping'), desc: t('home.featureShippingDesc') },
              { icon: HeadphonesIcon, title: t('home.featureSupport'), desc: t('home.featureSupportDesc') },
            ].map((feature) => (
              <Card key={feature.title} className="p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white group hover:border-sky-100">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-sky-50 flex items-center justify-center mb-5 group-hover:from-sky-50 group-hover:to-sky-100 transition-colors">
                  <feature.icon className="h-7 w-7 text-slate-500 group-hover:text-sky-600 transition-colors" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3 font-sans">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge variant="secondary" className="mb-3 bg-sky-100 text-sky-700 border-0">
                {t('home.news')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-sans">{t('home.news')}</h2>
              <p className="mt-2 text-slate-400">{t('home.newsDesc')}</p>
            </div>
            <Link href={`/${locale}/news`}>
              <Button variant="outline" className="hidden sm:inline-flex border-slate-200 text-slate-700 hover:bg-slate-50">
                {t('home.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/${locale}/news/${item.id}`}>
                <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full bg-white">
                  <div className="aspect-[16/9] bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors line-clamp-2 font-sans">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">{item.content}</p>
                    <div className="flex items-center mt-4 text-sm text-sky-600 font-medium group-hover:gap-1 transition-all">
                      {t('home.readMore')}
                      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
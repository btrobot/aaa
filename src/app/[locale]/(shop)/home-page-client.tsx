'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Shield, Ship, HeadphonesIcon, Building2, Newspaper, ChevronRight, Star, Cog, Sparkles, Palette } from 'lucide-react';
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
      {/* Floating colorful decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing orbs */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-cyan-300/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '3s' }} />
        
        {/* Floating colorful shapes */}
        <div className="absolute top-20 left-10 opacity-20 animate-float">
          <Star className="w-8 h-8 text-amber-300" fill="currentColor" />
        </div>
        <div className="absolute top-40 right-16 opacity-15 animate-float" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-6 h-6 text-cyan-200" />
        </div>
        <div className="absolute bottom-24 left-1/3 opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>
          <Palette className="w-7 h-7 text-amber-200" />
        </div>
        <div className="absolute bottom-32 right-1/4 opacity-15 animate-float" style={{ animationDelay: '1.5s' }}>
          <Star className="w-5 h-5 text-teal-200" fill="currentColor" />
        </div>

        {/* Decorative arc lines */}
        <svg className="absolute bottom-0 left-0 w-full h-48 opacity-[0.06]" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,100 C360,200 720,0 1440,100 L1440,200 L0,200 Z" fill="white" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div className="max-w-xl">
            <Badge className="mb-6 bg-white/15 text-white border-white/20 hover:bg-white/25 backdrop-blur-sm text-sm px-4 py-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
              {t('home.heroBadge')}
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 leading-tight">
              {t('home.heroTitle')}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
              {t('home.heroDesc')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products`}>
                <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-400 font-semibold px-8 py-6 text-base shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all">
                  {t('home.exploreProducts')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={`/${locale}/about`}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/15 hover:text-white px-8 py-6 text-base">
                  {t('home.learnMore')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Playful visual showcase */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-96 h-96">
              {/* Outer spinning ring */}
              <div className="absolute inset-0 rounded-full border border-white/20 animate-spin-slow" />
              <div className="absolute inset-4 rounded-full border border-white/10 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '25s' }} />
              <div className="absolute inset-8 rounded-full border border-white/5 animate-spin-slow" style={{ animationDuration: '30s' }} />
              {/* Color dots on rings */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full bg-cyan-300 shadow-lg shadow-cyan-300/50" />
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-teal-300 shadow-lg shadow-teal-300/50" />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <Cog className="w-20 h-20 text-white/20 animate-spin-slow mx-auto" style={{ animationDuration: '15s' }} />
                    <Cog className="w-14 h-14 text-white/30 animate-spin-slow absolute inset-0 m-auto" style={{ animationDirection: 'reverse', animationDuration: '12s' }} />
                  </div>
                  <div className="flex gap-2 justify-center mt-6">
                    <Star className="w-4 h-4 text-amber-300/60" fill="currentColor" />
                    <Star className="w-5 h-5 text-amber-300/80" fill="currentColor" />
                    <Star className="w-4 h-4 text-amber-300/60" fill="currentColor" />
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
    { value: '200+', label: t('home.statProducts'), color: 'text-teal-600' },
    { value: '50+', label: t('home.statCountries'), color: 'text-amber-500' },
    { value: '1000+', label: t('home.statClients'), color: 'text-sky-600' },
    { value: '15+', label: t('home.statYears'), color: 'text-teal-600' },
  ];

  return (
    <section className="relative -mt-12 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-900/5 border border-slate-100 px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`text-center ${i > 0 ? 'md:border-l md:border-slate-100 md:pl-6' : ''}`}>
                <div className={`text-3xl sm:text-4xl font-bold ${stat.color} mb-1 font-sans`}>{stat.value}</div>
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
      <section className={`py-20 bg-gradient-to-b from-amber-50/30 to-white transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <Badge className="mb-3 bg-teal-100 text-teal-700 border-0 hover:bg-teal-200">
                <Sparkles className="w-3 h-3 mr-1" />
                {t('home.featuredProducts')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 font-sans">{t('home.featuredProducts')}</h2>
              <p className="mt-2 text-slate-400">{t('home.featuredDesc')}</p>
            </div>
            <Link href={`/${locale}/products`}>
              <Button variant="outline" className="hidden sm:inline-flex border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all">
                {t('home.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product, index) => (
              <Link key={product.id} href={`/${locale}/products/${product.id}`}>
                <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full bg-white hover:border-teal-200"
                      style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="aspect-[4/3] bg-gradient-to-br from-teal-50 via-cyan-50 to-amber-50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cog className="h-16 w-16 text-slate-200 group-hover:scale-110 group-hover:rotate-90 group-hover:text-teal-300 transition-all duration-700" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors duration-300 line-clamp-1">
                      {product.description?.name || product.sku}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{product.sku}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                      <span className="text-lg font-bold text-slate-800">
                        ¥{parseFloat(product.price).toLocaleString()}
                      </span>
                      {product.brand && (
                        <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-700 border-0">
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
            <Badge className="mb-3 bg-amber-100 text-amber-700 border-0 hover:bg-amber-200">
              <Building2 className="w-3 h-3 mr-1" />
              {t('home.brands')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 font-sans">{t('home.brands')}</h2>
            <p className="mt-2 text-slate-400">{t('home.brandsDesc')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.slice(0, 4).map((brand) => (
              <Link key={brand.id} href={`/${locale}/brands`}>
                <Card className="p-8 text-center hover:shadow-lg transition-all duration-300 border border-slate-100 bg-white hover:border-amber-200 group cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-50 to-teal-50 flex items-center justify-center group-hover:from-amber-100 group-hover:to-teal-100 transition-colors">
                    <Building2 className="h-8 w-8 text-slate-500 group-hover:text-amber-600 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">{brand.name}</h3>
                  <p className="text-sm text-slate-400 mt-1.5 line-clamp-2">{brand.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-amber-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-teal-100 text-teal-700 border-0 hover:bg-teal-200">
              <Shield className="w-3 h-3 mr-1" />
              {t('home.featureQuality')}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 font-sans">{t('home.featureQuality')}</h2>
            <p className="mt-2 text-slate-400">{t('home.featureQualityDesc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: t('home.featureQuality'), desc: t('home.featureQualityDesc'), color: 'from-teal-50 to-cyan-50', iconColor: 'text-teal-600' },
              { icon: Ship, title: t('home.featureShipping'), desc: t('home.featureShippingDesc'), color: 'from-amber-50 to-orange-50', iconColor: 'text-amber-600' },
              { icon: HeadphonesIcon, title: t('home.featureSupport'), desc: t('home.featureSupportDesc'), color: 'from-sky-50 to-blue-50', iconColor: 'text-sky-600' },
            ].map((feature) => (
              <Card key={feature.title} className="p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 bg-white group hover:border-amber-200">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-3 font-sans">{feature.title}</h3>
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
              <Badge className="mb-3 bg-teal-100 text-teal-700 border-0 hover:bg-teal-200">
                <Newspaper className="w-3 h-3 mr-1" />
                {t('home.news')}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 font-sans">{t('home.news')}</h2>
              <p className="mt-2 text-slate-400">{t('home.newsDesc')}</p>
            </div>
            <Link href={`/${locale}/news`}>
              <Button variant="outline" className="hidden sm:inline-flex border-slate-200 text-slate-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all">
                {t('home.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/${locale}/news/${item.id}`}>
                <Card className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full bg-white hover:border-teal-200">
                  <div className="aspect-[16/9] bg-gradient-to-br from-teal-50 via-cyan-50 to-amber-50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-slate-300 group-hover:scale-110 group-hover:text-teal-400 transition-all duration-500" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-slate-800 group-hover:text-teal-700 transition-colors line-clamp-2 font-sans">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-2 leading-relaxed">{item.content}</p>
                    <div className="flex items-center mt-4 text-sm text-teal-600 font-medium group-hover:gap-1.5 transition-all">
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
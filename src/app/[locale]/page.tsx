'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from '@/i18n/useTranslations';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Globe, Cog, Award, CheckCircle, Star, Users, Building2, Factory } from 'lucide-react';
import { products } from '@/lib/product-data';

export default function HomePage() {
  const { locale, t } = useTranslations();

  const hotProducts = products.slice(0, 4);
  const cases = [
    {
      title: t('home.case1'),
      image: 'https://images.unsplash.com/photo-1561ae3c4e3c3e3c4e3c3e3c4e?w=600&q=80',
      tag: 'Dubai',
    },
    {
      title: t('home.case2'),
      image: 'https://images.unsplash.com/photo-1570488344390-4c9e3c0c1e3e?w=600&q=80',
      tag: 'Tokyo',
    },
    {
      title: t('home.case3'),
      image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e4b5c?w=600&q=80',
      tag: 'Singapore',
    },
  ];

  const advantages = [
    {
      icon: Cog,
      title: t('home.advantage1Title'),
      desc: t('home.advantage1Desc'),
    },
    {
      icon: Shield,
      title: t('home.advantage2Title'),
      desc: t('home.advantage2Desc'),
    },
    {
      icon: Globe,
      title: t('home.advantage3Title'),
      desc: t('home.advantage3Desc'),
    },
    {
      icon: Building2,
      title: t('home.advantage4Title'),
      desc: t('home.advantage4Desc'),
    },
  ];

  const stats = [
    { value: '1000+', label: t('home.projectsDone') },
    { value: '24+', label: t('home.yearsExperience') },
    { value: '50+', label: t('home.countriesServed') },
    { value: '50+', label: t('home.patents') },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />
        </div>
        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <Badge className="mb-6 bg-blue-400/20 text-blue-200 border-blue-400/30 px-4 py-1.5 text-sm">
                {t('site.subtitle')}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {t('home.heroTitle')}
              </h1>
              <p className="text-lg text-blue-100/80 mb-8 max-w-xl leading-relaxed">
                {t('home.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={`/${locale}/products`}>
                  <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-8 text-base">
                    {t('home.heroCta')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href={`/${locale}/contact`}>
                  <Button size="lg" variant="outline" className="border-blue-300 text-blue-100 hover:bg-blue-800/50 px-8 text-base">
                    {t('home.heroContact')}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1567095761054-7a02e69e4b5c?w=800&q=80"
                  alt="Amusement Park"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent" />
              </div>
              {/* Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 flex gap-4">
                {stats.slice(0, 2).map((stat) => (
                  <div key={stat.label} className="text-center px-3">
                    <div className="text-2xl font-bold text-blue-600">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Products */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.hotProducts')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('home.hotProductsDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hotProducts.map((product) => (
              <Link key={product.id} href={`/${locale}/products/${product.id}`}>
                <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={product.image}
                      alt={locale === 'zh' ? product.nameZh : product.nameEn}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium bg-blue-600 px-3 py-1 rounded-full">
                        {t('common.learnMore')}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {locale === 'zh' ? product.nameZh : product.nameEn}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {locale === 'zh' ? product.descZh : product.descEn}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-bold">{product.price}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {t(`products.${product.category}`)}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href={`/${locale}/products`}>
              <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                {t('common.viewAll')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.advantages')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('home.advantagesDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((adv) => (
              <div key={adv.title} className="text-center group">
                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                  <adv.icon className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{adv.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{t('home.cases')}</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">{t('home.casesDesc')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((item, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <Badge className="mb-2 bg-blue-500/80 text-white border-0">{item.tag}</Badge>
                  <h3 className="text-white font-semibold text-lg">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {locale === 'zh' ? '开启您的乐园梦想' : 'Start Your Park Dream'}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            {locale === 'zh'
              ? '无论您需要单个设备还是整园规划，我们都能为您提供专业解决方案'
              : 'Whether you need a single ride or a whole park plan, we provide professional solutions'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href={`/${locale}/contact`}>
              <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8">
                {t('home.heroContact')}
              </Button>
            </Link>
            <Link href={`/${locale}/products`}>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                {t('home.heroCta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Shield, Ship, HeadphonesIcon, Building2, Newspaper, ChevronRight, Mail, FileText, CheckCircle, Cog, FerrisWheel, Blocks, Rocket, Star, Gamepad2, ShieldCheck, Award, BadgeCheck, ClipboardCheck, Globe2, Factory, Users, Wrench, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { api, type Product, type Brand, type Page, type CategoryTreeNode } from '@/lib/api';

interface HomePageClientProps {
  initialProducts: Product[];
  initialBrands: Brand[];
  initialNews: Page[];
  locale: string;
}

const categoryIcons = [
  { icon: Cog, color: 'from-blue-500 to-cyan-500' },
  { icon: Star, color: 'from-purple-500 to-pink-500' },
  { icon: Gamepad2, color: 'from-amber-500 to-orange-500' },
  { icon: Blocks, color: 'from-emerald-500 to-teal-500' },
  { icon: FerrisWheel, color: 'from-rose-500 to-red-500' },
  { icon: Rocket, color: 'from-indigo-500 to-violet-500' },
];

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
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    // Load categories for showcase
    api.categories.list().then((cats) => {
      setCategories(cats || []);
    }).catch(() => {});
  }, []);

  const inquirySteps = [
    { icon: FileText, title: t('home.inquiryStep1'), desc: t('home.inquiryStep1Desc') },
    { icon: CheckCircle, title: t('home.inquiryStep2'), desc: t('home.inquiryStep2Desc') },
    { icon: Mail, title: t('home.inquiryStep3'), desc: t('home.inquiryStep3Desc') },
  ];

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
              <Link href={`/${locale}/products`}>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Mail className="mr-2 h-4 w-4" />
                  {t('home.sendInquiry')}
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

      {/* Category Showcase Section */}
      {categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900">{t('home.productCategories')}</h2>
              <p className="mt-2 text-gray-500">{t('home.productCategoriesDesc')}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat, idx) => {
                const iconDef = categoryIcons[idx % categoryIcons.length];
                const Icon = iconDef.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`/${locale}/products?category=${cat.id}`}
                    className="group"
                  >
                    <Card className="p-6 text-center hover:shadow-xl transition-all duration-300 border-0 bg-white hover:-translate-y-1 cursor-pointer">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${iconDef.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                        {cat.name}
                      </h3>
                      {cat.children && cat.children.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{cat.children.length} {t('home.subcategories')}</p>
                      )}
                    </Card>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-8">
              <Link href={`/${locale}/categories`}>
                <Button variant="outline">
                  {t('home.viewAllCategories')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section className={`py-16 bg-white transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
              <Link key={product.id} href={`/${locale}/products/${product.id}`} className="group">
                <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Cog className="w-20 h-20 text-blue-200" />
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

      {/* Certifications Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
              {t('home.certBadge')}
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">{t('home.certifications')}</h2>
            <p className="mt-2 text-gray-500 max-w-2xl mx-auto">{t('home.certificationsDesc')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, name: 'ISO 9001:2025', desc: t('home.certISO'), color: 'from-blue-500 to-blue-600' },
              { icon: BadgeCheck, name: 'CE', desc: t('home.certCE'), color: 'from-amber-500 to-orange-600' },
              { icon: ClipboardCheck, name: 'TUV Rheinland', desc: t('home.certTUV'), color: 'from-emerald-500 to-teal-600' },
              { icon: Award, name: 'SGS', desc: t('home.certSGS'), color: 'from-purple-500 to-violet-600' },
            ].map((cert) => (
              <Card key={cert.name} className="group p-6 text-center border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${cert.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <cert.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{cert.name}</h3>
                <p className="text-sm text-gray-500">{cert.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Global Partners Section */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
              {t('home.partnerBadge')}
            </Badge>
            <h2 className="text-3xl font-bold text-gray-900">{t('home.globalPartners')}</h2>
            <p className="mt-2 text-gray-500 max-w-2xl mx-auto">{t('home.globalPartnersDesc')}</p>
          </div>
          <div className="relative">
            {/* Scrolling partners row */}
            <div className="flex gap-8 animate-scroll">
              {[
                { name: 'Disney', icon: Star },
                { name: 'Universal', icon: Globe2 },
                { name: 'Six Flags', icon: Flag },
                { name: 'SeaWorld', icon: Ship },
                { name: 'Merlin', icon: Blocks },
                { name: 'Parques Reunidos', icon: Building2 },
                { name: 'Disney', icon: Star },
                { name: 'Universal', icon: Globe2 },
                { name: 'Six Flags', icon: Flag },
                { name: 'SeaWorld', icon: Ship },
                { name: 'Merlin', icon: Blocks },
                { name: 'Parques Reunidos', icon: Building2 },
              ].map((partner, i) => (
                <div key={i} className="flex-shrink-0 w-40 h-20 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center gap-2 hover:shadow-md hover:border-blue-200 transition-all duration-300 group">
                  <partner.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-400">{t('home.partnerFootnote')}</p>
          </div>
        </div>
      </section>

      {/* Factory & Production Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 bg-blue-50 text-blue-700 border-blue-200">
                {t('home.factoryBadge')}
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.factoryTitle')}</h2>
              <p className="text-gray-500 mb-8">{t('home.factoryDesc')}</p>
              <div className="space-y-4">
                {[
                  { icon: Factory, title: t('home.factoryFeature1'), desc: t('home.factoryFeature1Desc') },
                  { icon: Users, title: t('home.factoryFeature2'), desc: t('home.factoryFeature2Desc') },
                  { icon: Wrench, title: t('home.factoryFeature3'), desc: t('home.factoryFeature3Desc') },
                ].map((feat) => (
                  <div key={feat.title} className="flex gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <feat.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{feat.title}</h4>
                      <p className="text-sm text-gray-500">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href={`/${locale}/news`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    {t('home.learnMore')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 overflow-hidden shadow-xl border border-blue-100">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-indigo-600/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Factory className="w-24 h-24 text-blue-200 mx-auto mb-4" />
                    <p className="text-blue-400 text-sm font-medium">{t('home.factoryImageLabel')}</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-20 h-20 bg-blue-100/50 rounded-full blur-xl" />
                <div className="absolute bottom-4 right-4 w-32 h-32 bg-indigo-100/50 rounded-full blur-xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                  <div className="absolute top-[15%] left-[20%] w-3 h-3 bg-blue-300 rounded-full" />
                  <div className="absolute top-[30%] right-[25%] w-2 h-2 bg-indigo-300 rounded-full" />
                  <div className="absolute bottom-[35%] left-[30%] w-2.5 h-2.5 bg-sky-300 rounded-full" />
                  <div className="absolute bottom-[25%] right-[20%] w-3 h-3 bg-blue-400 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">{t('home.brands')}</h2>
            <p className="mt-2 text-gray-500">{t('home.brandsDesc')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {brands.slice(0, 4).map((brand) => (
              <Link key={brand.id} href={`/${locale}/brands`}>
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-0 bg-white hover:bg-white group cursor-pointer">
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
      <section className="py-16 bg-white">
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

      {/* Inquiry Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              {t('home.inquiryProcess')}
            </h2>
            <p className="mt-2 text-gray-500">
              {t('home.inquiryProcessDesc')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {inquirySteps.map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <step.icon className="h-10 w-10 text-blue-600" />
                </div>
                <div className="hidden md:block absolute top-10 left-[60%] w-[calc(80%)] h-px border-t-2 border-dashed border-gray-200" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href={`/${locale}/products`}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Mail className="mr-2 h-4 w-4" />
                {t('home.startInquiry')}
              </Button>
            </Link>
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
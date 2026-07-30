'use client';

import Image from 'next/image';
import { useTranslations } from '@/i18n/useTranslations';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Award, Factory, Shield, Target, TrendingUp, Clock, Users, Eye } from 'lucide-react';

export default function AboutPage() {
  const { locale, t } = useTranslations();

  const factoryImages = [
    {
      src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
      title: t('about.factory1'),
    },
    {
      src: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80',
      title: t('about.factory2'),
    },
    {
      src: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=600&q=80',
      title: t('about.factory3'),
    },
    {
      src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
      title: t('about.factory4'),
    },
  ];

  const certifications = [
    t('about.cert1'),
    t('about.cert2'),
    t('about.cert3'),
    t('about.cert4'),
    t('about.cert5'),
    t('about.cert6'),
  ];

  const history = [
    t('about.history1'),
    t('about.history2'),
    t('about.history3'),
    t('about.history4'),
    t('about.history5'),
    t('about.history6'),
  ];

  const values = [
    {
      icon: Target,
      title: locale === 'zh' ? '使命' : 'Mission',
      desc: locale === 'zh'
        ? '为全球客户提供安全、创新、高品质的游乐体验'
        : 'Providing safe, innovative, and high-quality amusement experiences for global customers',
    },
    {
      icon: Eye,
      title: locale === 'zh' ? '愿景' : 'Vision',
      desc: locale === 'zh'
        ? '成为全球最受信赖的游乐设施品牌'
        : 'Becoming the world\'s most trusted amusement ride brand',
    },
    {
      icon: Shield,
      title: locale === 'zh' ? '价值观' : 'Values',
      desc: locale === 'zh'
        ? '安全第一、品质为本、创新驱动、客户至上'
        : 'Safety First, Quality First, Innovation Driven, Customer First',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('about.title')}</h1>
          <p className="text-blue-100 text-lg">{t('about.subtitle')}</p>
        </div>
      </section>

      {/* Company Intro */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">{t('about.intro')}</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {locale === 'zh' ? '匠心制造，欢乐世界' : 'Crafted with Excellence, World of Joy'}
              </h2>
              <div className="text-gray-600 leading-relaxed space-y-4">
                {t('about.introText').split('\n\n').map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=800&q=80"
                  alt="Company"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="text-center bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                  <v.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{v.title}</h3>
                <p className="text-gray-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Factory Tour */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">{t('about.factory')}</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.factoryDesc')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {factoryImages.map((img, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden shadow-sm">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold">{img.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === 'zh' ? '发展历程' : 'Our History'}
            </h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200" />
            <div className="space-y-8">
              {history.map((item, i) => (
                <div key={i} className="relative pl-20">
                  <div className="absolute left-4 top-1 w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
                    {i + 1}
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm">
                    <p className="text-gray-700">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-0">{t('about.certificates')}</Badge>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {locale === 'zh' ? '资质认证与荣誉' : 'Certifications & Honors'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                <span className="text-gray-700 font-medium">{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}


'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ShieldCheck, Lightbulb, Award, Globe, Factory, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PageLayout } from '@/components/PageLayout';

const values = [
  { key: 'Safety', icon: ShieldCheck, color: 'from-blue-600 to-blue-700' },
  { key: 'Innovation', icon: Lightbulb, color: 'from-amber-500 to-orange-600' },
  { key: 'Quality', icon: Award, color: 'from-emerald-600 to-teal-600' },
  { key: 'Global', icon: Globe, color: 'from-violet-600 to-indigo-600' },
];

const stats = [
  { key: 'statsProducts', value: '200+' },
  { key: 'statsProjects', value: '1,500+' },
  { key: 'statsYears', value: '20+' },
  { key: 'statsCountries', value: '60+' },
];

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100/90 sm:text-xl">
              {t('heroDesc')}
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-6 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute -top-6 -left-6 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl" />
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('missionTitle')}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {t('missionDesc')}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t('statsTitle')}
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.key}
                className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md"
              >
                <div className="text-4xl font-bold text-blue-600">{stat.value}</div>
                <div className="mt-2 text-sm font-medium text-gray-600">{t(stat.key)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t('valuesTitle')}
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map(({ key, icon: Icon, color }) => (
            <div
              key={key}
              className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-br ${color} p-3 text-white shadow-lg`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">
                {t(`value${key}`)}
              </h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {t(`value${key}Desc`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Factory Showcase */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('statsTitle')}
              </h2>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: Factory, text: '50,000㎡ Smart Manufacturing Facility' },
                  { icon: Award, text: 'ISO 9001:2015 & CE Certified Production' },
                  { icon: Lightbulb, text: 'In-house R&D Team of 60+ Engineers' },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-800 to-indigo-900 shadow-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
              <div className="flex h-full items-center justify-center">
                <Factory className="h-24 w-24 text-white/30" />
              </div>
              {/* Decorative dots */}
              <div className="absolute bottom-4 left-4 right-4 grid grid-cols-20 gap-1 opacity-20">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="h-1 w-1 rounded-full bg-white" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 px-8 py-16 text-center shadow-xl sm:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t('ctaTitle')}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100/90">
              {t('ctaDesc')}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
              >
                {t('ctaButton')}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
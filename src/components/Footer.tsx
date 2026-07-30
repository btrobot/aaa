'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const { locale, t } = useTranslations();

  const productCategories = [
    { id: 'carousel', label: t('products.carousel') },
    { id: 'roller-coaster', label: t('products.rollerCoaster') },
    { id: 'bumper-car', label: t('products.bumperCar') },
    { id: 'ferris-wheel', label: t('products.ferrisWheel') },
    { id: 'water-ride', label: t('products.waterRide') },
    { id: 'kids-ride', label: t('products.kidsRide') },
  ];

  const quickLinks = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/products`, label: t('nav.products') },
    { href: `/${locale}/about`, label: t('nav.about') },
    { href: `/${locale}/news`, label: t('nav.news') },
    { href: `/${locale}/contact`, label: t('nav.contact') },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-lg font-bold text-white">{t('site.title')}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              {t('site.description')}
            </p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'linkedin', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-9 w-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs font-bold uppercase text-gray-400 hover:text-white">
                    {social[0].toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.products')}</h3>
            <ul className="space-y-2.5">
              {productCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${locale}/products?category=${cat.id}`}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1"
                  >
                    {cat.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contactInfo')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-400">{t('contact.addressValue')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-400">{t('contact.phoneValue')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-400">{t('contact.emailValue')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-blue-400 shrink-0" />
                <span className="text-sm text-gray-400">{t('contact.workingHoursValue')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">{t('footer.copyright')}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{t('footer.icp')}</span>
            <span className="hidden sm:inline">|</span>
            <Link href="#" className="hover:text-blue-400 transition-colors">
              {t('footer.privacy')}
            </Link>
            <span className="hidden sm:inline">|</span>
            <Link href="#" className="hover:text-blue-400 transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
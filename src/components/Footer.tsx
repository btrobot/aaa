'use client';

import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const { locale, t } = useTranslations();

  const quickLinks = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/products`, label: t('nav.products') },
    { href: `/${locale}/categories`, label: t('nav.categories') },
    { href: `/${locale}/brands`, label: t('nav.brands') },
  ];

  const customerService = [
    { href: '#', label: t('footer.helpCenter') },
    { href: '#', label: t('footer.shippingInfo') },
    { href: '#', label: t('footer.returnPolicy') },
    { href: '#', label: t('footer.sizeGuide') },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-lg font-bold text-white">{t('site.title')}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">{t('footer.aboutDesc')}</p>
            <div className="flex gap-3">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="h-9 w-9 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs font-bold uppercase text-gray-400 hover:text-white">{social[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-orange-400 transition-colors inline-flex items-center gap-1">
                    {link.label}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.customerService')}</h3>
            <ul className="space-y-2.5">
              {customerService.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.contactInfo')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-orange-400 shrink-0" />
                <span className="text-sm text-gray-400">{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-orange-400 shrink-0" />
                <span className="text-sm text-gray-400">{t('footer.phone')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-orange-400 shrink-0" />
                <span className="text-sm text-gray-400">{t('footer.email')}</span>
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
            <Link href="#" className="hover:text-orange-400 transition-colors">{t('footer.privacy')}</Link>
            <span className="hidden sm:inline">|</span>
            <Link href="#" className="hover:text-orange-400 transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
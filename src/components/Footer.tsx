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
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-lg font-bold text-white">{t('site.title')}</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-4">{t('footer.aboutDesc')}</p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="h-9 w-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="#" aria-label="Twitter" className="h-9 w-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" aria-label="Instagram" className="h-9 w-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="h-9 w-9 rounded-full bg-gray-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75,15.02 15.5,11.75 9.75,8.48" fill="white"/></svg>
              </a>
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
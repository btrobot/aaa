'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Mail, Phone, MapPin, ArrowUpRight, Cog } from 'lucide-react';

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations();

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
    <footer className="bg-slate-900 text-slate-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-teal-600 flex items-center justify-center">
                <Cog className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white font-sans">NodeCoda</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">{t('footer.aboutDesc')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-sans">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1">
                    {link.label}
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-sans">{t('footer.customerService')}</h3>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-amber-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-sans">{t('footer.contactInfo')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-slate-400">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-amber-400" />
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Phone className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{t('footer.phone')}</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="h-4 w-4 shrink-0 text-amber-400" />
                <span>{t('footer.email')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">{t('footer.copyright')}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <Link href="#" className="hover:text-amber-400 transition-colors">{t('footer.privacy')}</Link>
            <Link href="#" className="hover:text-amber-400 transition-colors">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
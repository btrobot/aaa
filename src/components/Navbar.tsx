'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { useCart } from '@/lib/cart-context';
import { locales, localeNames } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { Menu, X, ShoppingCart, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { locale, t, setLocale } = useTranslations();
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/products`, label: t('nav.products') },
    { href: `/${locale}/about`, label: t('nav.about') },
    { href: `/${locale}/news`, label: t('nav.news') },
    { href: `/${locale}/contact`, label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-900">{t('site.title')}</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href={`/${locale}`}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              {t('nav.home')}
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setProductOpen(true)}
              onMouseLeave={() => setProductOpen(false)}
            >
              <Link
                href={`/${locale}/products`}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors inline-flex items-center gap-1"
              >
                {t('nav.products')}
                <ChevronDown className="h-3 w-3" />
              </Link>
              {productOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border bg-white shadow-lg p-1">
                  <Link
                    href={`/${locale}/products`}
                    className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    {t('products.all')}
                  </Link>
                  {['carousel', 'roller-coaster', 'bumper-car', 'ferris-wheel', 'water-ride', 'kids-ride'].map((cat) => (
                    <Link
                      key={cat}
                      href={`/${locale}/products?category=${cat}`}
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      {t(`products.${cat}`)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href={`/${locale}/about`}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              {t('nav.about')}
            </Link>
            <Link
              href={`/${locale}/news`}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              {t('nav.news')}
            </Link>
            <Link
              href={`/${locale}/contact`}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              {t('nav.contact')}
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-gray-600"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{localeNames[locale]}</span>
              </Button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border bg-white shadow-lg p-1">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLocale(l);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        locale === l
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {localeNames[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href={`/${locale}/cart`}>
              <Button variant="ghost" size="sm" className="relative text-gray-600">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-600"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2">
              <p className="px-3 py-1 text-xs text-gray-500 font-medium">{t('nav.language')}</p>
              <div className="flex gap-1 px-3 py-1">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLocale(l);
                      setMobileOpen(false);
                    }}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      locale === l
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {localeNames[l]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
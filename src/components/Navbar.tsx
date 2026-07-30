'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/useTranslations';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/i18n/CurrencyProvider';
import { locales, localeNames } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { Menu, X, ShoppingCart, ChevronDown, Globe, User, Search, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { currencies as allCurrencies, currencySymbols, type Currency } from '@/i18n/CurrencyProvider';

export default function Navbar() {
  const { locale, t, setLocale } = useTranslations();
  const { totalItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const navLinks = [
    { href: `/${locale}`, label: t('nav.home') },
    { href: `/${locale}/products`, label: t('nav.products') },
    { href: `/${locale}/categories`, label: t('nav.categories') },
    { href: `/${locale}/brands`, label: t('nav.brands') },
    { href: `/${locale}/news`, label: t('nav.news') },
    { href: `/${locale}/about`, label: t('nav.about') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top Bar */}
      <div className="hidden lg:block border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
          <div className="flex items-center justify-end gap-4 text-xs text-gray-500">
            <Link href={`/${locale}/account`} className="hover:text-blue-600 transition-colors inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {t('nav.account')}
            </Link>
            <Link href={`/${locale}/account/orders`} className="hover:text-blue-600 transition-colors">
              {t('nav.orders')}
            </Link>
            <Link href={`/${locale}/account/wishlist`} className="hover:text-blue-600 transition-colors inline-flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {t('nav.wishlist')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">{t('site.title')}</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 rounded-full bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Toggle - Mobile */}
            <Button variant="ghost" size="sm" className="lg:hidden text-gray-600" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            {/* Language Switcher */}
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 text-gray-600">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{localeNames[locale]}</span>
              </Button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border bg-white shadow-lg p-1 z-50">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        locale === l ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {localeNames[l]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="text-gray-600 gap-1" onClick={() => setCurrOpen(!currOpen)}>
                <span className="text-sm">{currencySymbols[currency]}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              {currOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  {allCurrencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCurrency(c); setCurrOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        currency === c ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {currencySymbols[c]} {c}
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
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-medium">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="lg:hidden text-gray-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden lg:block border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 h-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 rounded-md hover:bg-orange-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/account`}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 rounded-md hover:bg-orange-50 transition-colors ml-auto"
            >
              <User className="h-3.5 w-3.5 inline-block mr-1" />
              {t('nav.account')}
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="lg:hidden border-t bg-white p-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-full bg-gray-50"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-2 mt-2">
              <Link
                href={`/${locale}/account`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
              >
                <User className="h-3.5 w-3.5 inline-block mr-2" />
                {t('nav.account')}
              </Link>
              <Link
                href={`/${locale}/account/wishlist`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
              >
                <Heart className="h-3.5 w-3.5 inline-block mr-2" />
                {t('nav.wishlist')}
              </Link>
            </div>
            <div className="border-t pt-2 mt-2">
              <p className="px-3 py-1 text-xs text-gray-500 font-medium">{t('nav.language')}</p>
              <div className="flex gap-1 px-3 py-1">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLocale(l); setMobileOpen(false); }}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      locale === l ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
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
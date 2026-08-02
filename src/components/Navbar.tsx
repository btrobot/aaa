'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useCart } from '@/lib/cart-context';
import { useCurrency } from '@/i18n/CurrencyProvider';
import { routing, localeNames } from '@/i18n/routing';
import { Menu, X, ShoppingCart, ChevronDown, Globe, User, Search, Heart, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { currencies as allCurrencies, currencySymbols } from '@/i18n/CurrencyProvider';

export default function Navbar() {
  const locale = useLocale();
  const t = useTranslations();
  const router = useRouter();
  const { totalItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { locales } = routing;

  const setLocale = (newLocale: string) => {
    router.replace('/', { locale: newLocale });
  };

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
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Top Bar */}
      <div className="hidden lg:block border-b border-slate-100 bg-amber-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5">
          <div className="flex items-center justify-end gap-4 text-xs text-slate-500">
            <Link href={`/${locale}/account`} className="hover:text-teal-600 transition-colors inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {t('nav.account')}
            </Link>
            <Link href={`/${locale}/account/orders`} className="hover:text-teal-600 transition-colors">
              {t('nav.orders')}
            </Link>
            <Link href={`/${locale}/account/wishlist`} className="hover:text-teal-600 transition-colors inline-flex items-center gap-1">
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
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0 group">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-600 to-teal-700 flex items-center justify-center group-hover:from-amber-500 group-hover:to-teal-600 transition-all duration-300">
              <Cog className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 hidden sm:block font-sans">{t('site.title')}</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder={t('nav.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 rounded-full bg-amber-50/50 border-slate-200 focus:bg-white focus:border-teal-300 transition-colors"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Toggle - Mobile */}
            <Button variant="ghost" size="sm" className="lg:hidden text-slate-500" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-5 w-5" />
            </Button>

            {/* Language Switcher */}
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 text-slate-500 hover:text-teal-600 hover:bg-amber-50">
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{localeNames[locale as keyof typeof localeNames]}</span>
              </Button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-slate-100 bg-white shadow-lg p-1 z-50">
                  {locales.map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLocale(l); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        locale === l ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-amber-50'
                      }`}
                    >
                      {localeNames[l as keyof typeof localeNames]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Selector */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="text-slate-500 gap-1 hover:text-teal-600 hover:bg-amber-50" onClick={() => setCurrOpen(!currOpen)}>
                <span className="text-sm">{currencySymbols[currency]}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
              {currOpen && (
                <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                  {allCurrencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCurrency(c); setCurrOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        currency === c ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-amber-50'
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
              <Button variant="ghost" size="sm" className="relative text-slate-500 hover:text-teal-600 hover:bg-amber-50">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-medium">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="lg:hidden text-slate-500" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Nav Links */}
      <div className="hidden lg:block border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 h-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 rounded-md hover:bg-amber-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/account`}
              className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-teal-600 rounded-md hover:bg-amber-50 transition-colors ml-auto"
            >
              <User className="h-3.5 w-3.5 inline-block mr-1" />
              {t('nav.account')}
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Search */}
      {searchOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white p-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder={t('nav.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-full bg-amber-50/50"
              autoFocus
            />
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-amber-50 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-slate-100 pt-2 mt-2">
              <Link
                href={`/${locale}/account`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-amber-50 rounded-md transition-colors"
              >
                <User className="h-3.5 w-3.5 inline-block mr-2" />
                {t('nav.account')}
              </Link>
              <Link
                href={`/${locale}/account/wishlist`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-amber-50 rounded-md transition-colors"
              >
                <Heart className="h-3.5 w-3.5 inline-block mr-2" />
                {t('nav.wishlist')}
              </Link>
            </div>
            <div className="border-t border-slate-100 pt-2 mt-2">
              <p className="px-3 py-1 text-xs text-slate-400 font-medium">{t('nav.language')}</p>
              <div className="flex gap-1 px-3 py-1">
                {locales.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLocale(l); setMobileOpen(false); }}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      locale === l ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-amber-50'
                    }`}
                  >
                    {localeNames[l as keyof typeof localeNames]}
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
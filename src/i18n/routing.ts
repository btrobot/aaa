import { defineRouting } from 'next-intl/routing';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/locales';

export const routing = defineRouting({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});

export const localeNames: Record<string, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ru: 'Русский',
  pt: 'Português',
  ar: 'العربية',
  th: 'ไทย',
};
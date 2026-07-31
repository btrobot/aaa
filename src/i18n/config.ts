export type Locale = 'zh' | 'en' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'ru' | 'pt' | 'ar' | 'th';

export const defaultLocale: Locale = 'zh';

export const locales: Locale[] = ['zh', 'en', 'ja', 'ko', 'es', 'fr', 'de', 'ru', 'pt', 'ar', 'th'];

export const localeNames: Record<Locale, string> = {
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

export type TranslationKey = string;

const messages: Record<string, Record<string, string>> = {};

export async function loadMessages(locale: Locale) {
  if (messages[locale]) return messages[locale];
  const data = await import(`../messages/${locale}.json`);
  messages[locale] = data.default || data;
  return messages[locale];
}

export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}

export function getStaticMessages(_locale: Locale): Record<string, string> {
  return {};
}
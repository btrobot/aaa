import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from '@/lib/locales';

export type Locale = SupportedLocale;

export const defaultLocale: Locale = DEFAULT_LOCALE;

export const locales: Locale[] = [...SUPPORTED_LOCALES];

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

import zhMessages from '../messages/zh.json';
import enMessages from '../messages/en.json';

/** 将嵌套的 JSON 消息拍平为 `site.title` → 值 的键值对 */
function flattenMessages(
  nested: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(nested)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenMessages(value as Record<string, unknown>, fullKey));
    } else {
      result[fullKey] = String(value ?? '');
    }
  }
  return result;
}

const staticMessageMap: Record<string, Record<string, string>> = {
  zh: flattenMessages(zhMessages as Record<string, unknown>),
  en: flattenMessages(enMessages as Record<string, unknown>),
};

export function getStaticMessages(locale: Locale): Record<string, string> {
  return staticMessageMap[locale] || staticMessageMap[DEFAULT_LOCALE] || {};
}
'use client';

import { useState, useCallback, useEffect, ReactNode } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { I18nContext } from './useTranslations';
import type { Locale } from './config';
import { locales, getStaticMessages } from './config';

const messageCache: Record<string, Record<string, string>> = {};

function flattenMessages(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      result[fullKey] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenMessages(value as Record<string, unknown>, fullKey));
    }
  }
  return result;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const localeParam = (params?.locale as string) || 'zh';
  const detectedLocale = locales.includes(localeParam as Locale) ? (localeParam as Locale) : 'zh';

  const [locale, setLocaleState] = useState<Locale>(detectedLocale);
  const [messages, setMessages] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocaleState(detectedLocale);
  }, [detectedLocale]);

  useEffect(() => {
    async function load() {
      if (messageCache[locale]) {
        setMessages(messageCache[locale]);
        return;
      }
      try {
        const data = await import(`../messages/${locale}.json`);
        const flat = flattenMessages(data.default || data);
        messageCache[locale] = flat;
        setMessages(flat);
      } catch {
        const fallback = getStaticMessages(locale);
        messageCache[locale] = fallback;
        setMessages(fallback);
      }
    }
    load();
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let value = messages[key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [messages]
  );

  const setLocale = useCallback(
    (newLocale: Locale) => {
      const path = pathname.replace(/^\/(zh|en|ja|ko|es|fr|de|ru|pt|ar|th)/, `/${newLocale}`);
      router.push(path);
    },
    [pathname, router]
  );

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}
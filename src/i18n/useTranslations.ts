'use client';

import { createContext, useContext } from 'react';
import type { Locale } from './config';

export interface I18nContextType {
  locale: Locale;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextType>({
  locale: 'zh',
  t: (key: string) => key,
  setLocale: () => {},
});

export function useTranslations() {
  return useContext(I18nContext);
}

export function useT() {
  const { t } = useTranslations();
  return t;
}
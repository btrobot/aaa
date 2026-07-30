'use client';

import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';

export type Currency = 'CNY' | 'USD' | 'EUR' | 'JPY' | 'KRW' | 'GBP' | 'AUD' | 'HKD' | 'THB' | 'SGD' | 'MYR';

export const currencies: Currency[] = ['CNY', 'USD', 'EUR', 'JPY', 'KRW', 'GBP', 'AUD', 'HKD', 'THB', 'SGD', 'MYR'];

export const currencySymbols: Record<Currency, string> = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  KRW: '₩',
  GBP: '£',
  AUD: 'A$',
  HKD: 'HK$',
  THB: '฿',
  SGD: 'S$',
  MYR: 'RM',
};

export const currencyNames: Record<Currency, string> = {
  CNY: 'CNY (¥)',
  USD: 'USD ($)',
  EUR: 'EUR (€)',
  JPY: 'JPY (¥)',
  KRW: 'KRW (₩)',
  GBP: 'GBP (£)',
  AUD: 'AUD (A$)',
  HKD: 'HKD (HK$)',
  THB: 'THB (฿)',
  SGD: 'SGD (S$)',
  MYR: 'MYR (RM)',
};

// Base exchange rates (relative to CNY = 1)
const exchangeRates: Record<Currency, number> = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.13,
  JPY: 21.5,
  KRW: 190.0,
  GBP: 0.11,
  AUD: 0.21,
  HKD: 1.09,
  THB: 5.05,
  SGD: 0.19,
  MYR: 0.66,
};

export interface CurrencyContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceInCny: number | string) => string;
  convertPrice: (priceInCny: number | string) => number;
  currencySymbol: string;
}

export const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'CNY',
  setCurrency: () => {},
  formatPrice: () => '',
  convertPrice: () => 0,
  currencySymbol: '¥',
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('CNY');

  useEffect(() => {
    const saved = localStorage.getItem('preferred_currency') as Currency | null;
    if (saved && currencies.includes(saved)) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('preferred_currency', c);
  }, []);

  const convertPrice = useCallback(
    (priceInCny: number | string): number => {
      const num = typeof priceInCny === 'string' ? parseFloat(priceInCny) : priceInCny;
      return Math.round(num * exchangeRates[currency] * 100) / 100;
    },
    [currency]
  );

  const formatPrice = useCallback(
    (priceInCny: number | string): string => {
      const num = convertPrice(priceInCny);
      const symbol = currencySymbols[currency];
      if (currency === 'JPY' || currency === 'KRW') {
        return `${symbol}${Math.round(num).toLocaleString()}`;
      }
      return `${symbol}${num.toFixed(2).toLocaleString()}`;
    },
    [convertPrice, currency]
  );

  const contextValue = useMemo(
    () => ({ currency, setCurrency, formatPrice, convertPrice, currencySymbol: currencySymbols[currency] }),
    [currency, setCurrency, formatPrice, convertPrice]
  );

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
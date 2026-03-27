'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, getLocale, setLocale as saveLocale, t as translate } from '@/lib/i18n';

interface LocaleContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-TW');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocaleState(getLocale());
    setMounted(true);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    saveLocale(l);
  };

  const t = (key: string) => translate(key, locale);

  if (!mounted) {
    // SSR: render with zh-TW to match default locale (avoids English flash)
    return (
      <LocaleContext.Provider value={{ locale: 'zh-TW', setLocale, t: (key) => translate(key, 'zh-TW') }}>
        {children}
      </LocaleContext.Provider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}

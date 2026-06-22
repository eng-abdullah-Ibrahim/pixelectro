"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

import enDict from '../../locales/en.json';
import arDict from '../../locales/ar.json';
import zhDict from '../../locales/zh.json';
import hiDict from '../../locales/hi.json';
import esDict from '../../locales/es.json';
import frDict from '../../locales/fr.json';
import itDict from '../../locales/it.json';
import bnDict from '../../locales/bn.json';
import ruDict from '../../locales/ru.json';
import ptDict from '../../locales/pt.json';
import urDict from '../../locales/ur.json';
import idDict from '../../locales/id.json';
import deDict from '../../locales/de.json';
import jaDict from '../../locales/ja.json';
import trDict from '../../locales/tr.json';
import koDict from '../../locales/ko.json';

// All 16 dictionaries statically bundled — instant switching, zero network latency
const ALL_DICTS: Record<string, any> = {
  en: enDict,
  ar: arDict,
  zh: zhDict,
  hi: hiDict,
  es: esDict,
  fr: frDict,
  it: itDict,
  bn: bnDict,
  ru: ruDict,
  pt: ptDict,
  ur: urDict,
  id: idDict,
  de: deDict,
  ja: jaDict,
  tr: trDict,
  ko: koDict,
};

const RTL_LANGS = ['ar', 'ur', 'he', 'fa'];

type TranslationContextType = {
  locale: string;
  setLocale: (code: string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

function resolve(dict: any, key: string): string | undefined {
  const parts = key.split('.');
  let v: any = dict;
  for (const p of parts) {
    if (v == null || typeof v !== 'object') return undefined;
    v = v[p];
  }
  return typeof v === 'string' ? v : undefined;
}

export function TranslationProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale?: string;
}) {
  const [locale, setLocaleState] = useState(initialLocale);
  const [dict, setDict] = useState<any>(ALL_DICTS[initialLocale] ?? enDict);

  const setLocale = useCallback((code: string) => {
    // Save to cookie for 1 year
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setLocaleState(code);

    // Instantly switch — all dicts are statically bundled
    setDict(ALL_DICTS[code] ?? enDict);

    // Update html dir + lang + data-lang attributes for RTL support
    document.documentElement.lang = code;
    document.documentElement.dir = RTL_LANGS.includes(code) ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('data-lang', code);
  }, []);

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
    const cookieLang = match ? match[1] : null;
    if (cookieLang && cookieLang !== locale) {
      setLocale(cookieLang);
    } else if (!cookieLang) {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let result = resolve(dict, key) ?? resolve(enDict, key) ?? key;
    if (params) {
      Object.keys(params).forEach(p => {
        result = result.replace(`{${p}}`, String(params[p]));
      });
    }
    return result;
  }, [dict]);

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslation must be used inside <TranslationProvider>');
  return ctx;
}

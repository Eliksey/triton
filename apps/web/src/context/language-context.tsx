'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import type { Language } from '@/lib/types';

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
};

const STORAGE_KEY = 'triton_lang';
const LANGUAGE_EVENT = 'triton:language-change';

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'ru';
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'ru' || stored === 'en' ? stored : 'ru';
}

function subscribeLanguage(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  const listener = () => onStoreChange();
  window.addEventListener('storage', listener);
  window.addEventListener(LANGUAGE_EVENT, listener);
  return () => {
    window.removeEventListener('storage', listener);
    window.removeEventListener(LANGUAGE_EVENT, listener);
  };
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const lang = useSyncExternalStore<Language>(
    subscribeLanguage,
    readStoredLanguage,
    (): Language => 'ru',
  );

  const setLang = useCallback((next: Language) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
      window.dispatchEvent(new Event(LANGUAGE_EVENT));
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
    }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}

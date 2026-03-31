'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, translations, getStoredLanguage, setStoredLanguage } from './i18n';

interface I18nContextType {
  lang: Language;
  t: Translations;
  setLang: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLangState(getStoredLanguage());
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    setStoredLanguage(newLang);
  };

  const value: I18nContextType = {
    lang,
    t: translations[lang],
    setLang,
  };

  // Prevent hydration mismatch by rendering children only after mount
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ lang: 'en', t: translations.en, setLang: () => {} }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

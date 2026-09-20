import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../i18n/translations';
import { translations } from '../i18n/translations';

import { toHinglish } from '../utils/hinglishHelper';

export interface BilingualResult {
  primary: string;
  secondary: string;
  combined: string;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  bi: (gu: string, en: string, hi?: string, separator?: string) => BilingualResult;
  formatBi: (gu: string, en: string, hi?: string, separator?: string) => string;
  tBi: (key: string, separator?: string) => BilingualResult;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('agromind_lang') as Language;
    return saved && ['gu', 'hi', 'en'].includes(saved) ? saved : 'gu';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('agromind_lang', lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const bi = (gu: string, en: string, hi?: string, separator = ' / '): BilingualResult => {
    if (language === 'gu') {
      // Show ONLY Gujarati + English text
      return {
        primary: gu,
        secondary: en,
        combined: `${gu}${separator}${en}`,
      };
    } else if (language === 'hi') {
      // Show Hinglish text!
      const hinglish = toHinglish(hi, en) || en;
      return {
        primary: hinglish,
        secondary: en,
        combined: `${hinglish}${separator}${en}`,
      };
    } else {
      return {
        primary: en,
        secondary: gu,
        combined: `${en}${separator}${gu}`,
      };
    }
  };

  const formatBi = (gu: string, en: string, hi?: string, separator = ' / '): string => {
    return bi(gu, en, hi, separator).combined;
  };

  const tBi = (key: string, separator = ' / '): BilingualResult => {
    const guText = translations['gu']?.[key] || '';
    const enText = translations['en']?.[key] || '';
    const hiText = translations['hi']?.[key] || '';
    return bi(guText, enText, hiText, separator);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, bi, formatBi, tBi }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

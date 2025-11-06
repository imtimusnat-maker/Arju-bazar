'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';
import enTranslations from '@/locales/en/common.json';
import bnTranslations from '@/locales/bn/common.json';
import enErrors from '@/locales/en/errors.json';
import bnErrors from '@/locales/bn/errors.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enTranslations,
        errors: enErrors,
      },
      bn: {
        common: bnTranslations,
        errors: bnErrors,
      },
    },
    lng: 'en', // default language
    fallbackLng: 'en',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: any) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');
  const { t, i18n: i18nInstance } = useTranslation(['common', 'errors']);

  useEffect(() => {
    i18nInstance.changeLanguage(language);
  }, [language, i18nInstance]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

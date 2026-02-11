import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Supported languages with their configurations
export const supportedLanguages = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  es: { name: 'Spanish', nativeName: 'Espanol', dir: 'ltr' },
  pt: { name: 'Portuguese', nativeName: 'Portugues', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Francais', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  zh: { name: 'Chinese', nativeName: '中文', dir: 'ltr' },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// Check if a language is RTL
export const isRTL = (lang: string): boolean => {
  return supportedLanguages[lang as SupportedLanguage]?.dir === 'rtl';
};

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: Object.keys(supportedLanguages),
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    ns: ['common', 'nav', 'hub', 'map', 'auth', 'movements'],
    defaultNS: 'common',

    react: {
      useSuspense: true,
    },
  });

i18n.on('languageChanged', (lng) => {
  const dir = isRTL(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;

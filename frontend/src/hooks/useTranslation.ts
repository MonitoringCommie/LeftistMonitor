import { useTranslation as useI18nTranslation } from 'react-i18next';

// Type-safe translation hook
export function useAppTranslation(ns?: string | string[]) {
  const { t, i18n, ready } = useI18nTranslation(ns);
  
  const isRTL = i18n.dir() === 'rtl';
  const currentLanguage = i18n.language;
  
  return {
    t,
    i18n,
    ready,
    isRTL,
    currentLanguage,
    changeLanguage: i18n.changeLanguage,
  };
}

// Namespaced hooks for convenience
export function useCommonTranslation() {
  return useAppTranslation('common');
}

export function useNavTranslation() {
  return useAppTranslation('nav');
}

export function useHubTranslation() {
  return useAppTranslation('hub');
}

export function useMapTranslation() {
  return useAppTranslation('map');
}

export function useAuthTranslation() {
  return useAppTranslation('auth');
}

export function useMovementsTranslation() {
  return useAppTranslation('movements');
}

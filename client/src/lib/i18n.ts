import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en/translation.json';
import translationRU from '../locales/ru/translation.json';
import translationLV from '../locales/lv/translation.json';

const STORAGE_KEY = 'ai-agents-language';

const isBrowser = typeof window !== 'undefined';

const getStoredLanguage = (): string | null => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const getBrowserLanguage = (): string => {
  if (!isBrowser || typeof navigator === 'undefined') return 'en';
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('lv')) return 'lv';
  return 'en';
};

const detectLanguage = (): string => {
  return getStoredLanguage() || getBrowserLanguage();
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translationEN,
      },
      ru: {
        translation: translationRU,
      },
      lv: {
        translation: translationLV,
      },
    },
    lng: detectLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

i18n.on('languageChanged', (lng) => {
  if (!isBrowser) return;
  
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch (error) {
    console.warn('Failed to save language preference:', error);
  }
  
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lng);
  }
});

if (isBrowser && typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', i18n.language);
}

export default i18n;

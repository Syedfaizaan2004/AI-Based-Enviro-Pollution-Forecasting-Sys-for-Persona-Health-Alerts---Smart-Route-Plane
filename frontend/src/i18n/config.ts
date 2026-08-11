import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguageCode,
} from '@/constants/languages';

// Create a custom fetcher using the VITE_API_URL if it exists
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const savedLanguage = normalizeLanguageCode(
  (() => {
    try {
      return window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    } catch {
      return null;
    }
  })()
);

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: savedLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGE_OPTIONS.map((language) => language.code),
    nonExplicitSupportedLngs: false,
    // Don't block the initial render — translations load async in background
    initImmediate: false,
    interpolation: {
      escapeValue: false // React already escapes values
    },
    // Prevent React Suspense from blocking rendering while translations load
    react: {
      useSuspense: false,
    },
    backend: {
      // Fetch translations from our FastAPI endpoint
      loadPath: `${baseURL}/translation/static?lng={{lng}}`,
      // Custom parser to map the flat dict into the 'translation' namespace
      parse: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          return parsed;
        } catch {
          return {};
        }
      },
      // If backend is down, don't crash — just show keys
      requestOptions: {
        cache: 'default',
      },
    },
  });

export default i18n;

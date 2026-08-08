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
const savedLanguage = normalizeLanguageCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng: savedLanguage,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: LANGUAGE_OPTIONS.map((language) => language.code),
    nonExplicitSupportedLngs: false,
    interpolation: {
      escapeValue: false // React already escapes values
    },
    backend: {
      // Fetch translations from our new FastAPI endpoint
      loadPath: `${baseURL}/translation/static?lng={{lng}}`,
      // Custom parser to map the flat dict into the 'translation' namespace
      parse: (data: string) => {
        try {
          const parsed = JSON.parse(data);
          // i18next expects resources to be in the namespace, so if backend returns flat dict, it works natively
          return parsed;
        } catch {
          return {};
        }
      }
    }
  });

export default i18n;

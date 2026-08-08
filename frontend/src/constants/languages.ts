export const DEFAULT_LANGUAGE = 'en-IN';
export const LANGUAGE_STORAGE_KEY = 'airsense-language';

export const LANGUAGE_OPTIONS = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'as-IN', label: 'Assamese' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'brx-IN', label: 'Bodo' },
  { code: 'doi-IN', label: 'Dogri' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'kok-IN', label: 'Konkani' },
  { code: 'ks-IN', label: 'Kashmiri' },
  { code: 'mai-IN', label: 'Maithili' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'mni-IN', label: 'Manipuri' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'ne-IN', label: 'Nepali' },
  { code: 'od-IN', label: 'Odia' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'sa-IN', label: 'Sanskrit' },
  { code: 'sat-IN', label: 'Santali' },
  { code: 'sd-IN', label: 'Sindhi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'ur-IN', label: 'Urdu' },
] as const;

export type SupportedLanguageCode = (typeof LANGUAGE_OPTIONS)[number]['code'];

const LANGUAGE_ALIASES: Record<string, SupportedLanguageCode> = {
  en: 'en-IN',
  as: 'as-IN',
  bn: 'bn-IN',
  brx: 'brx-IN',
  doi: 'doi-IN',
  gu: 'gu-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  kok: 'kok-IN',
  ks: 'ks-IN',
  mai: 'mai-IN',
  ml: 'ml-IN',
  mni: 'mni-IN',
  mr: 'mr-IN',
  ne: 'ne-IN',
  od: 'od-IN',
  or: 'od-IN',
  pa: 'pa-IN',
  sa: 'sa-IN',
  sat: 'sat-IN',
  sd: 'sd-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ur: 'ur-IN',
};

const supportedCodes = new Set<string>(LANGUAGE_OPTIONS.map((language) => language.code));

export function normalizeLanguageCode(language?: string | null): SupportedLanguageCode {
  if (!language) return DEFAULT_LANGUAGE;

  const firstLanguage = language.split(',')[0]?.split(';')[0]?.trim();
  if (!firstLanguage) return DEFAULT_LANGUAGE;

  const [baseCode, regionCode] = firstLanguage.replace('_', '-').split('-');
  const normalized = regionCode
    ? `${baseCode.toLowerCase()}-${regionCode.toUpperCase()}`
    : baseCode.toLowerCase();

  if (supportedCodes.has(normalized)) {
    return normalized as SupportedLanguageCode;
  }

  return LANGUAGE_ALIASES[baseCode.toLowerCase()] || DEFAULT_LANGUAGE;
}

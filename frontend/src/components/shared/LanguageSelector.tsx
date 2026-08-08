import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { api } from '@/services/api';
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_OPTIONS,
  LANGUAGE_STORAGE_KEY,
  normalizeLanguageCode,
  type SupportedLanguageCode,
} from '@/constants/languages';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

type LanguageSelectorProps = {
  className?: string;
};

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguageCode>(
    normalizeLanguageCode(i18n.language || DEFAULT_LANGUAGE)
  );
  const selectedOption = useMemo(
    () => LANGUAGE_OPTIONS.find((language) => language.code === selectedLanguage) || LANGUAGE_OPTIONS[0],
    [selectedLanguage]
  );

  useEffect(() => {
    const handleLanguageChange = (language: string) => {
      setSelectedLanguage(normalizeLanguageCode(language));
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const selectLanguage = async (languageCode: SupportedLanguageCode) => {
    const nextLanguage = normalizeLanguageCode(languageCode);
    setSelectedLanguage(nextLanguage);
    setIsOpen(false);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    await i18n.changeLanguage(nextLanguage);

    if (isAuthenticated) {
      api.patch('/preferences', { preferred_language: nextLanguage }).catch(() => {
        // Local language switching should still work if saving preferences fails.
      });
    }
  };

  return (
    <div
      ref={dropdownRef}
      data-no-translate
      className={cn('relative inline-block w-44 max-w-full text-left', className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-9 w-full cursor-pointer items-center rounded-full border border-border/50 bg-muted/40 pl-3 pr-2 text-sm text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select language"
        title="Select language"
      >
        <Languages className="mr-2 h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 truncate text-left font-medium">
          {selectedOption.label}
        </span>
        <ChevronDown
          className={cn(
            'ml-2 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border/60 bg-popover text-popover-foreground shadow-xl">
          <div
            role="listbox"
            aria-label="Select language"
            className="max-h-80 overflow-y-auto p-1"
          >
            {LANGUAGE_OPTIONS.map((language) => {
              const isSelected = language.code === selectedLanguage;

              return (
                <button
                  key={language.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectLanguage(language.code)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none',
                    isSelected && 'bg-accent text-accent-foreground'
                  )}
                >
                  <span className="min-w-0 flex-1 truncate">{language.label}</span>
                  {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

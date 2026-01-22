import { useMemo } from 'react';
import type { Language, I18nKey } from './translations';
import { translations, format } from './translations';

export function useI18n(language: Language) {
  return useMemo(() => {
    const dict = translations[language] ?? translations['zh-CN'];
    const t = (key: I18nKey, vars?: Record<string, string>) => {
      const raw = dict[key] ?? key;
      return vars ? format(raw, vars) : raw;
    };
    return { t };
  }, [language]);
}

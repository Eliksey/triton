import type { Language } from './types';

const monthFormatters = {
  ru: new Intl.DateTimeFormat('ru-RU', { month: 'short', year: 'numeric' }),
  en: new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }),
} as const;

export function formatReleaseMonth(monthValue: string, lang: Language): string {
  const date = new Date(`${monthValue}-01T00:00:00.000Z`);
  return monthFormatters[lang].format(date);
}


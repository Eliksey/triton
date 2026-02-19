'use client';

import { useLanguage } from '@/context/language-context';

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="lang-toggle">
      <button
        className={`lang-btn ${lang === 'ru' ? 'active' : ''}`}
        type="button"
        onClick={() => setLang('ru')}
      >
        RU
      </button>
      <button
        className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
        type="button"
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  );
}


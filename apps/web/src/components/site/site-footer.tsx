'use client';

import { t } from '@/lib/i18n';
import { useLanguage } from '@/context/language-context';

export function SiteFooter() {
  const { lang } = useLanguage();
  return (
    <footer>
      <strong>Тритон.</strong> {t(lang, 'footer')}
    </footer>
  );
}


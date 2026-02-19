'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { t } from '@/lib/i18n';
import { useLanguage } from '@/context/language-context';
import { LanguageToggle } from './language-toggle';

export function PublicNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [query, setQuery] = useState('');

  const links = useMemo(
    () => [
      { href: '/', label: t(lang, 'nav_home') },
      { href: '/issues', label: t(lang, 'nav_issues') },
      { href: '/about', label: t(lang, 'nav_about') },
    ],
    [lang],
  );

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized.length) return;
    router.push(`/issues?q=${encodeURIComponent(normalized)}`);
    setQuery('');
  };

  return (
    <nav>
      <Link href="/" className="nav-logo">
        Тритон<span>.</span>
      </Link>

      <div className="nav-links">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <form className="nav-search-wrap" onSubmit={handleSearchSubmit}>
        <input
          className="nav-search-input"
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t(lang, 'search_placeholder')}
        />
        <span className="nav-search-icon">🔍</span>
      </form>

      <div className="nav-right">
        <LanguageToggle />
      </div>
    </nav>
  );
}


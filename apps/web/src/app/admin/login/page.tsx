'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { LanguageToggle } from '@/components/site/language-toggle';
import { useLanguage } from '@/context/language-context';
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/auth-token';
import { login, me } from '@/lib/api';
import { t } from '@/lib/i18n';

export default function AdminLoginPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const token = getAuthToken();
      if (!token) return;
      try {
        await me(token);
        router.replace('/admin/dashboard');
      } catch {
        clearAuthToken();
      }
    })();
  }, [router]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const result = await login({ username, password });
      setAuthToken(result.accessToken);
      router.push('/admin/dashboard');
    } catch {
      setErrorMessage(t(lang, 'auth_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">
          Тритон<span>.</span>
        </Link>
        <div className="nav-links">
          <Link href="/">{t(lang, 'nav_home')}</Link>
          <Link href="/issues">{t(lang, 'nav_issues')}</Link>
          <Link href="/about">{t(lang, 'nav_about')}</Link>
        </div>
        <div className="nav-right">
          <LanguageToggle />
        </div>
      </nav>

      <div id="page-admin" className="page active">
        <div className="admin-wrapper">
          <div id="admin-login">
            <div className="login-box">
              <div className="lock-icon">🔐</div>
              <h2>{t(lang, 'admin_login_title')}</h2>
              <p>{t(lang, 'admin_login_sub')}</p>
              <form onSubmit={onSubmit}>
                <div className="form-group">
                  <label>{t(lang, 'username')}</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder={t(lang, 'username')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t(lang, 'password')}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={t(lang, 'password')}
                    required
                  />
                </div>
                {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
                <button className="form-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '...' : t(lang, 'sign_in')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


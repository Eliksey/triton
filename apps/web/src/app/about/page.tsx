'use client';

import { PublicNav } from '@/components/site/public-nav';
import { SiteFooter } from '@/components/site/site-footer';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/i18n';

export default function AboutPage() {
  const { lang } = useLanguage();

  return (
    <>
      <PublicNav />
      <div className="page active">
        <div className="page-header">
          <h1>{t(lang, 'about_title')}</h1>
          <p>{t(lang, 'about_p2')}</p>
        </div>
        <div className="about-strip">
          <div className="about-inner">
            <div>
              <h2>{t(lang, 'about_title')}</h2>
              <p>{t(lang, 'about_p1')}</p>
              <p>{t(lang, 'about_p2')}</p>
              <p className="about-editor-line">{t(lang, 'about_editor')}</p>
            </div>
            <div className="about-features">
              <div className="about-feature">
                <div className="feature-icon">✍️</div>
                <div className="feature-text">
                  <h4>{t(lang, 'feat1_title')}</h4>
                  <p>{t(lang, 'feat1_text')}</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="feature-icon">🎨</div>
                <div className="feature-text">
                  <h4>{t(lang, 'feat2_title')}</h4>
                  <p>{t(lang, 'feat2_text')}</p>
                </div>
              </div>
              <div className="about-feature">
                <div className="feature-icon">📖</div>
                <div className="feature-text">
                  <h4>{t(lang, 'feat3_title')}</h4>
                  <p>{t(lang, 'feat3_text')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    </>
  );
}


'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { IssueCard } from '@/components/site/issue-card';
import { IssueModal } from '@/components/site/issue-modal';
import { PublicNav } from '@/components/site/public-nav';
import { SiteFooter } from '@/components/site/site-footer';
import { useLanguage } from '@/context/language-context';
import { fetchIssues } from '@/lib/api';
import { t } from '@/lib/i18n';
import type { Issue } from '@/lib/types';

export default function HomePage() {
  const { lang } = useLanguage();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const fetched = await fetchIssues();
        setIssues(fetched);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const latest = useMemo(() => issues.slice(0, 4), [issues]);
  const featured = latest[0];
  const rest = latest.slice(1);

  return (
    <>
      <PublicNav />
      <div id="page-home" className="page active">
        <div className="hero">
          <div className="hero-inner">
            <div className="hero-tag">📰 {t(lang, 'hero_tag')}</div>
            <h1>
              {t(lang, 'hero_title_start')} <br />
              <em>{t(lang, 'hero_title_em')}</em>
            </h1>
            <p>{t(lang, 'hero_sub')}</p>
            <div className="hero-btns">
              <Link href="/issues" className="btn-primary">
                {t(lang, 'hero_btn_issues')}
              </Link>
              <Link href="/about" className="btn-outline">
                {t(lang, 'hero_btn_about')}
              </Link>
            </div>
          </div>
        </div>

        <div className="stats-bar">
          <div className="stat">
            <div className="stat-num">{issues.length}</div>
            <div className="stat-label">{t(lang, 'stat_issues')}</div>
          </div>
          <div className="stat">
            <div className="stat-num">2021</div>
            <div className="stat-label">{t(lang, 'stat_founded')}</div>
          </div>
          <div className="stat">
            <div className="stat-num">100%</div>
            <div className="stat-label">{t(lang, 'stat_students')}</div>
          </div>
          <div className="stat">
            <div className="stat-num">∞</div>
            <div className="stat-label">{t(lang, 'stat_stories')}</div>
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">{t(lang, 'latest_issues')}</h2>
            <Link href="/issues" className="see-all">
              {t(lang, 'see_all')}
            </Link>
          </div>

          {loading ? (
            <div className="issues-grid">
              <div className="loading-state">⏳</div>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🭭</div>
              <h3>{t(lang, 'empty_issues')}</h3>
              <p>{t(lang, 'empty_issues_sub')}</p>
            </div>
          ) : featured ? (
            <div className="issues-featured-grid">
              <IssueCard
                issue={featured}
                index={0}
                lang={lang}
                onOpen={setSelectedIssue}
                featured
              />
              <div className="issues-small-col">
                {rest.map((issue, index) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    index={index + 1}
                    lang={lang}
                    onOpen={setSelectedIssue}
                    small
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="how-it-works">
          <div className="how-it-works-inner">
            <h2 className="section-title">{t(lang, 'how_title')}</h2>
            <p className="how-subtitle">{t(lang, 'how_sub')}</p>
            <div className="how-cards">
              <div className="how-card">
                <div className="how-card-icon">✍️</div>
                <div className="how-card-num">01</div>
                <h4>{t(lang, 'how1_title')}</h4>
                <p>{t(lang, 'how1_text')}</p>
              </div>
              <div className="how-card">
                <div className="how-card-icon">📅</div>
                <div className="how-card-num">02</div>
                <h4>{t(lang, 'how2_title')}</h4>
                <p>{t(lang, 'how2_text')}</p>
              </div>
              <div className="how-card">
                <div className="how-card-icon">💡</div>
                <div className="how-card-num">03</div>
                <h4>{t(lang, 'how3_title')}</h4>
                <p>{t(lang, 'how3_text')}</p>
              </div>
            </div>
          </div>
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

      <IssueModal issue={selectedIssue} lang={lang} onClose={() => setSelectedIssue(null)} />
    </>
  );
}

'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IssueCard } from '@/components/site/issue-card';
import { IssueModal } from '@/components/site/issue-modal';
import { PublicNav } from '@/components/site/public-nav';
import { SiteFooter } from '@/components/site/site-footer';
import { useLanguage } from '@/context/language-context';
import { fetchIssues } from '@/lib/api';
import { t } from '@/lib/i18n';
import { filterIssues } from '@/lib/issues-filter';
import type { Issue } from '@/lib/types';

function IssuesPageContent() {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [query, setQuery] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialQuery = searchParams.get('q')?.trim() ?? '';
    setQuery(initialQuery);
  }, [searchParams]);

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

  const filtered = useMemo(() => {
    return filterIssues(issues, query);
  }, [issues, query]);

  return (
    <>
      <PublicNav />
      <div id="page-issues" className="page active">
        <div className="page-header">
          <h1>{t(lang, 'issues_page_title')}</h1>
          <p>{t(lang, 'issues_page_sub')}</p>
        </div>

        <div className="section">
          <div className="search-row">
            <div className="issues-search-wrap">
              <input
                id="issues-search-input"
                type="text"
                placeholder={t(lang, 'search_placeholder')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span>🔍</span>
            </div>
            {query.trim().length ? (
              <div id="issues-search-count">{`${filtered.length} ${t(lang, 'search_found_suffix')}`}</div>
            ) : null}
          </div>

          {loading ? (
            <div className="issues-grid">
              <div className="loading-state">⏳</div>
            </div>
          ) : filtered.length ? (
            <div className="issues-grid">
              {filtered.map((issue, index) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  index={index}
                  lang={lang}
                  onOpen={setSelectedIssue}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>{t(lang, 'search_no_results')}</h3>
              <p>{t(lang, 'search_no_results_sub')}</p>
            </div>
          )}
        </div>

        <SiteFooter />
      </div>

      <IssueModal issue={selectedIssue} lang={lang} onClose={() => setSelectedIssue(null)} />
    </>
  );
}

function IssuesPageFallback() {
  const { lang } = useLanguage();
  return (
    <>
      <PublicNav />
      <div id="page-issues" className="page active">
        <div className="page-header">
          <h1>{t(lang, 'issues_page_title')}</h1>
          <p>{t(lang, 'issues_page_sub')}</p>
        </div>
        <div className="section">
          <div className="issues-grid">
            <div className="loading-state">⏳</div>
          </div>
        </div>
        <SiteFooter />
      </div>
    </>
  );
}

export default function IssuesPage() {
  return (
    <Suspense fallback={<IssuesPageFallback />}>
      <IssuesPageContent />
    </Suspense>
  );
}

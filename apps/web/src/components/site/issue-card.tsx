'use client';

import { formatReleaseMonth } from '@/lib/date';
import { t } from '@/lib/i18n';
import type { Issue, Language } from '@/lib/types';

type IssueCardProps = {
  issue: Issue;
  index: number;
  lang: Language;
  onOpen: (issue: Issue) => void;
  featured?: boolean;
  small?: boolean;
};

export function IssueCard({
  issue,
  index,
  lang,
  onOpen,
  featured = false,
  small = false,
}: IssueCardProps) {
  const themeClass = `cover-theme-${index % 5}`;
  const cardClass = [
    'issue-card',
    featured ? 'issue-card-featured' : '',
    small ? 'issue-card-small' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={cardClass}
      onClick={() => onOpen(issue)}
      data-badge={featured ? `✦ ${t(lang, 'latest_badge')}` : undefined}
    >
      {issue.coverUrl ? (
        <div className={`issue-cover issue-cover-img-wrap ${themeClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={issue.coverUrl} alt={issue.title} className="issue-cover-img" />
        </div>
      ) : (
        <div className={`issue-cover ${themeClass}${small ? ' issue-cover-small' : ''}`}>
          <div className="issue-cover-inner">
            <div className="mag-name">Triton</div>
            {!small ? <div className="mag-issue">{issue.releaseMonth}</div> : null}
          </div>
        </div>
      )}
      <div className="issue-info">
        <h3>{issue.title}</h3>
        <div className="issue-date">{formatReleaseMonth(issue.releaseMonth, lang)}</div>
        {issue.description ? (
          <div className={`issue-desc ${featured ? 'issue-desc-featured' : ''}`}>
            {issue.description}
          </div>
        ) : null}
        <span className="read-btn">
          {small ? t(lang, 'read_short') : t(lang, 'read_issue')}
        </span>
      </div>
    </button>
  );
}


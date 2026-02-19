'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { IssueModal } from '@/components/site/issue-modal';
import { LanguageToggle } from '@/components/site/language-toggle';
import { useLanguage } from '@/context/language-context';
import { clearAuthToken, getAuthToken } from '@/lib/auth-token';
import {
  createIssue,
  deleteIssue,
  fetchIssues,
  me,
  updateIssue,
} from '@/lib/api';
import { formatReleaseMonth } from '@/lib/date';
import { t } from '@/lib/i18n';
import type { Issue } from '@/lib/types';

type EditState = {
  issue: Issue;
  title: string;
  releaseMonth: string;
  description: string;
  pdf: File | null;
  cover: File | null;
  removeCover: boolean;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [title, setTitle] = useState('');
  const [releaseMonth, setReleaseMonth] = useState('');
  const [description, setDescription] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const sortedIssues = useMemo(() => {
    return [...issues].sort((a, b) => b.releaseMonth.localeCompare(a.releaseMonth));
  }, [issues]);

  useEffect(() => {
    void (async () => {
      const token = getAuthToken();
      if (!token) {
        router.replace('/admin/login');
        return;
      }
      try {
        await me(token);
      } catch {
        clearAuthToken();
        router.replace('/admin/login');
        return;
      }

      await refreshIssues();
      setLoading(false);
    })();
  }, [router]);

  const refreshIssues = async () => {
    const fetched = await fetchIssues();
    setIssues(fetched);
  };

  const onCreateIssue = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    if (!pdfFile) {
      setErrorMessage(t(lang, 'upload_error'));
      return;
    }
    const token = getAuthToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await createIssue(token, {
        title,
        releaseMonth,
        description,
        pdf: pdfFile,
        cover: coverFile,
      });
      setTitle('');
      setReleaseMonth('');
      setDescription('');
      setPdfFile(null);
      setCoverFile(null);
      if (pdfInputRef.current) {
        pdfInputRef.current.value = '';
      }
      if (coverInputRef.current) {
        coverInputRef.current.value = '';
      }
      await refreshIssues();
    } catch {
      setErrorMessage(t(lang, 'upload_error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteIssue = async (issueId: string) => {
    if (!window.confirm(t(lang, 'delete_confirm'))) return;
    const token = getAuthToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    await deleteIssue(token, issueId);
    await refreshIssues();
  };

  const onLogout = () => {
    clearAuthToken();
    router.replace('/admin/login');
  };

  const startEdit = (issue: Issue) => {
    setEditState({
      issue,
      title: issue.title,
      releaseMonth: issue.releaseMonth,
      description: issue.description || '',
      pdf: null,
      cover: null,
      removeCover: false,
    });
  };

  const onSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editState) return;
    const token = getAuthToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    await updateIssue(token, editState.issue.id, {
      title: editState.title,
      releaseMonth: editState.releaseMonth,
      description: editState.description,
      pdf: editState.pdf,
      cover: editState.cover,
      removeCover: editState.removeCover,
    });

    setEditState(null);
    await refreshIssues();
  };

  const setEditFile = (field: 'pdf' | 'cover', event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!editState) return;
    setEditState({
      ...editState,
      [field]: file,
      removeCover: field === 'cover' && file ? false : editState.removeCover,
    });
  };

  if (loading) {
    return (
      <>
        <nav>
          <Link href="/" className="nav-logo">
            Тритон<span>.</span>
          </Link>
          <div className="nav-right">
            <LanguageToggle />
          </div>
        </nav>
        <div className="loading-state">⏳</div>
      </>
    );
  }

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
          <div id="admin-dashboard" className="admin-dashboard">
            <div className="admin-topbar">
              <div>
                <h2>📋 {t(lang, 'dashboard_title')}</h2>
                <span>{t(lang, 'dashboard_sub')}</span>
              </div>
              <button className="logout-btn" type="button" onClick={onLogout}>
                {t(lang, 'logout')}
              </button>
            </div>

            <div className="admin-body">
              <div className="upload-panel">
                <h3>📤 {t(lang, 'add_issue')}</h3>
                <form onSubmit={onCreateIssue}>
                  <div className="form-group">
                    <label>{t(lang, 'issue_title')}</label>
                    <input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t(lang, 'release_month')}</label>
                    <input
                      type="month"
                      value={releaseMonth}
                      onChange={(event) => setReleaseMonth(event.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t(lang, 'issue_desc')}</label>
                    <textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>{t(lang, 'issue_pdf')}</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      ref={pdfInputRef}
                      onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>{t(lang, 'issue_cover')}</label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={coverInputRef}
                      onChange={(event) => setCoverFile(event.target.files?.[0] || null)}
                    />
                  </div>
                  {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
                  <button className="form-submit" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? '...' : t(lang, 'publish')}
                  </button>
                </form>
              </div>

              <div className="issues-list-panel">
                <h3>
                  {t(lang, 'published_issues')}{' '}
                  <span className="issues-count">{sortedIssues.length}</span>
                </h3>
                <div id="admin-issues-list">
                  {sortedIssues.map((issue, index) => (
                    <div className="admin-issue-row" key={issue.id}>
                      {issue.coverUrl ? (
                        <div className={`admin-issue-thumb cover-theme-${index % 5}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={issue.coverUrl}
                            alt={issue.title}
                            className="admin-issue-thumb-img"
                          />
                        </div>
                      ) : (
                        <div className={`admin-issue-thumb cover-theme-${index % 5}`}>Triton</div>
                      )}
                      <div className="admin-issue-info">
                        <h4>{issue.title}</h4>
                        <span>
                          {formatReleaseMonth(issue.releaseMonth, lang)} ·{' '}
                          {issue.coverUrl ? t(lang, 'cover_ok') : t(lang, 'cover_missing')}
                        </span>
                      </div>
                      <div className="admin-issue-actions">
                        <button className="btn-edit" type="button" onClick={() => startEdit(issue)}>
                          {t(lang, 'edit')}
                        </button>
                        <button
                          className="btn-view-small"
                          type="button"
                          onClick={() => setSelectedIssue(issue)}
                        >
                          View
                        </button>
                        <button
                          className="btn-delete"
                          type="button"
                          onClick={() => void onDeleteIssue(issue.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editState ? (
        <div
          className="modal-overlay modal-overlay-soft open"
          onClick={() => setEditState(null)}
        >
          <div className="edit-modal-card" onClick={(event) => event.stopPropagation()}>
            <h3 className="edit-modal-title">✏️ {t(lang, 'edit')}</h3>
            <p className="edit-modal-subtitle">{editState.issue.title}</p>
            <form onSubmit={onSaveEdit}>
              <div className="form-group">
                <label>{t(lang, 'issue_title')}</label>
                <input
                  value={editState.title}
                  onChange={(event) =>
                    setEditState({ ...editState, title: event.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>{t(lang, 'release_month')}</label>
                <input
                  type="month"
                  value={editState.releaseMonth}
                  onChange={(event) =>
                    setEditState({ ...editState, releaseMonth: event.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>{t(lang, 'issue_desc')}</label>
                <textarea
                  value={editState.description}
                  onChange={(event) =>
                    setEditState({ ...editState, description: event.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>{t(lang, 'issue_pdf')}</label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setEditFile('pdf', event)}
                />
              </div>
              <div className="form-group">
                <label>{t(lang, 'issue_cover')}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setEditFile('cover', event)}
                />
                {editState.issue.coverUrl ? (
                  <button
                    type="button"
                    className="btn-link-danger"
                    onClick={() => setEditState({ ...editState, removeCover: true, cover: null })}
                  >
                    {t(lang, 'remove_cover')}
                  </button>
                ) : null}
              </div>
              <div className="edit-modal-actions">
                <button type="submit" className="form-submit">
                  {t(lang, 'save')}
                </button>
                <button
                  type="button"
                  className="edit-cancel-btn"
                  onClick={() => setEditState(null)}
                >
                  {t(lang, 'cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <IssueModal issue={selectedIssue} lang={lang} onClose={() => setSelectedIssue(null)} />
    </>
  );
}

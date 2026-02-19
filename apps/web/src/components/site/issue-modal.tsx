'use client';

import { useEffect } from 'react';
import type { Issue, Language } from '@/lib/types';

type IssueModalProps = {
  issue: Issue | null;
  lang: Language;
  onClose: () => void;
};

export function IssueModal({ issue, lang, onClose }: IssueModalProps) {
  useEffect(() => {
    if (!issue) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [issue, onClose]);

  if (!issue) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <div className="modal-header-logo">
              Тритон<span>.</span>
            </div>
            <h3 id="modal-title">{issue.title}</h3>
          </div>
          <div className="modal-header-right">
            <button
              className="modal-fullscreen-btn"
              type="button"
              onClick={() => {
                const iframe = document.getElementById('modal-iframe');
                if (iframe instanceof HTMLElement) {
                  void iframe.requestFullscreen?.();
                }
              }}
            >
              ⛶ {lang === 'ru' ? 'На весь экран' : 'Fullscreen'}
            </button>
            <button className="modal-close" type="button" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <div className="modal-iframe-wrap">
          <iframe
            id="modal-iframe"
            src={issue.pdfUrl}
            title={issue.title}
            allow="fullscreen"
          />
        </div>
      </div>
    </div>
  );
}

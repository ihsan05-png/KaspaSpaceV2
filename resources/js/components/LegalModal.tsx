import { useEffect } from 'react';
import { LEGAL_DOCS } from '../data/products';

type LegalKey = keyof typeof LEGAL_DOCS;

interface Props {
  docKey: LegalKey;
  onClose: () => void;
}

export default function LegalModal({ docKey, onClose }: Props) {
  const doc = LEGAL_DOCS[docKey];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="legal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="legal-modal">
        <div className="legal-modal-head">
          <div>
            <h2>
              {doc.title}{doc.titleEm ? <> <em>{doc.titleEm}</em></> : ''}
            </h2>
            <div className="legal-modal-updated">{doc.updated}</div>
          </div>
          <button type="button" className="legal-close" onClick={onClose} aria-label="Tutup">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="legal-modal-body">
          <p className="legal-intro">{doc.intro}</p>
          {doc.sections.map((s, i) => (
            <div key={i} className="legal-section">
              <h3 className="legal-section-h">{s.h}</h3>
              <ul>
                {s.items.map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

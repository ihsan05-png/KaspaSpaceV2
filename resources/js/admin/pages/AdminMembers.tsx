import { useState, useMemo, useRef } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import { fetchUsers, ApiUser, sendEmailToUser } from '../../lib/adminApi';

/* ── Email Modal ─────────────────────────────────────────────── */
function EmailModal({ user, onClose }: { user: ApiUser; onClose: () => void }) {
  const [subject,    setSubject]    = useState('');
  const [message,    setMessage]    = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending,    setSending]    = useState(false);
  const [result,     setResult]     = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await sendEmailToUser(user.id, subject, message, attachment ?? undefined);
      setResult({ ok: true, text: res.message });
    } catch (e: unknown) {
      setResult({ ok: false, text: (e as { message?: string })?.message ?? 'Gagal mengirim email.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-head">
          <h3>Kirim <em>Email</em></h3>
          <button className="icon-btn" onClick={onClose} aria-label="Tutup"><AdminIcon.X /></button>
        </div>
        <div className="modal-body" style={{ display: 'grid', gap: 14 }}>

          {/* Penerima */}
          <div className="co-field">
            <label>Kepada</label>
            <input type="text" value={`${user.name} <${user.email}>`} readOnly
              style={{ background: 'var(--surface-2)', color: 'var(--text-secondary)', cursor: 'default' }} />
          </div>

          {/* Subjek */}
          <div className="co-field">
            <label>Subjek</label>
            <input
              type="text"
              placeholder="Contoh: Informasi Promo Bulan Juni"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>

          {/* Pesan */}
          <div className="co-field">
            <label>Pesan</label>
            <textarea
              placeholder="Tulis pesan di sini..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              disabled={sending}
            />
          </div>

          {/* Lampiran */}
          <div className="co-field">
            <label>Lampiran <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(opsional — maks. 10 MB)</span></label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: 13 }}
                onClick={() => fileRef.current?.click()}
                disabled={sending}
              >
                <AdminIcon.Upload /> Pilih File
              </button>
              {attachment ? (
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attachment.name}
                  <button type="button" style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: 13 }}
                    onClick={() => { setAttachment(null); if (fileRef.current) fileRef.current.value = ''; }}>✕</button>
                </span>
              ) : (
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Gambar (JPG/PNG), PDF, atau Word (DOC/DOCX)</span>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={e => setAttachment(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Hasil */}
          {result && (
            <div style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13,
              background: result.ok ? 'rgba(52,211,153,.1)' : 'rgba(239,68,68,.1)',
              border: `1px solid ${result.ok ? 'rgba(52,211,153,.3)' : 'rgba(239,68,68,.3)'}`,
              color: result.ok ? 'var(--success)' : 'var(--error)' }}>
              {result.text}
            </div>
          )}
        </div>

        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose} disabled={sending}>Batal</button>
          <button
            className="btn btn-primary"
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
          >
            {sending ? 'Mengirim...' : 'Kirim Email'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────── */
export default function AdminMembers() {
  const { data: res, loading } = useApiGet(() => fetchUsers());
  const users: ApiUser[] = res?.data ?? [];

  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('Semua');
  const [emailTarget, setEmailTarget] = useState<ApiUser | null>(null);

  const filtered = useMemo(() => users.filter(u => {
    if (roleFilter !== 'Semua' && u.role !== roleFilter) return false;
    if (search && !`${u.name} ${u.email} ${u.phone ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [users, search, roleFilter]);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Akun</em></h1>
          <p className="admin-page-sub">{loading ? '—' : `${res?.total ?? users.length} akun terdaftar`}</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search"
            placeholder="Cari nama atau email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select aria-label="Filter role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option>Semua</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <p className="panel-sub">Memuat data member...</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Kontak</th>
                <th>Role</th>
                <th>Bergabung</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="col-title">
                    <div className="cell-media">
                      <div className="admin-avatar admin-avatar-md">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="cell-media-meta">
                        <span className="t">{u.name}</span>
                        <span className="s">#{u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cell-media-meta">
                      <span className="t cell-email">{u.email}</span>
                      <span className="s">{u.phone ?? '—'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`tag ${u.role === 'admin' ? 'private-office' : 'share-desk'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{fmtDate(u.created_at)}</td>
                  <td className="col-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      title="Kirim email"
                      onClick={() => setEmailTarget(u)}
                    >
                      <AdminIcon.Mail />
                    </button>
                    <button type="button" className="icon-btn" title="Detail member">
                      <AdminIcon.Eye />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="panel-sub order-summary">
        Menampilkan <strong className="count-hl">{filtered.length}</strong> dari {users.length} member
      </p>

      {emailTarget && <EmailModal user={emailTarget} onClose={() => setEmailTarget(null)} />}
    </>
  );
}

import { useState, useMemo } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import { fetchAdminReviews, updateReviewStatus, deleteReview, ApiReview } from '../../lib/adminApi';

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const TYPE_LABEL: Record<string, string> = {
  biz: 'Bisnis', product_type: 'Coworking', fnb: 'F&B',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', approved: 'Approved', rejected: 'Ditolak',
};

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ color: '#f59e0b', letterSpacing: 1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ opacity: i <= rating ? 1 : 0.25 }}>★</span>
      ))}
    </span>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  setTimeout(onDone, 3000);
  return (
    <div className="toast">
      <div className="toast-icon"><AdminIcon.Check /></div>
      <div><div className="t">{msg}</div><div className="s">Perubahan tersimpan</div></div>
    </div>
  );
}

export default function AdminReview() {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter]   = useState('Semua');
  const [toastMsg, setToastMsg]       = useState('');

  const params: Record<string, string> = {};
  if (statusFilter !== 'Semua') params.status = statusFilter;
  if (typeFilter   !== 'Semua') params.type   = typeFilter;
  if (search)                   params.search  = search;

  const { data: res, loading, refetch } = useApiGet(() => fetchAdminReviews(params));
  const reviews: ApiReview[] = res?.data ?? [];

  const doStatus = async (id: number, status: string) => {
    await updateReviewStatus(id, status);
    setToastMsg(status === 'approved' ? 'Review disetujui' : 'Review ditolak');
    refetch();
  };

  const doDelete = async (r: ApiReview) => {
    if (!confirm(`Hapus review dari "${r.reviewer_name}"?`)) return;
    await deleteReview(r.id);
    setToastMsg('Review dihapus');
    refetch();
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Ulasan</em></h1>
          <p className="admin-page-sub">Moderasi ulasan produk dari member.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-toolbar" style={{ marginTop: 0 }}>
          <div className="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="search" placeholder="Cari nama atau komentar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select aria-label="Filter tipe" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option>Semua</option>
            <option value="biz">Bisnis</option>
            <option value="product_type">Coworking</option>
            <option value="fnb">F&B</option>
          </select>
          <select aria-label="Filter status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>Semua</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>

        {loading ? <p className="panel-sub">Memuat ulasan...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Produk</th>
                  <th>Rating</th>
                  <th>Komentar</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div className="cell-media-meta">
                        <span className="t">{r.reviewer_name}</span>
                        {r.user && <span className="s">{r.user.email}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="cell-media-meta">
                        <span className="t">{r.reviewable_name ?? r.reviewable_key}</span>
                        <span className="s">{TYPE_LABEL[r.reviewable_type] ?? r.reviewable_type}</span>
                      </div>
                    </td>
                    <td><Stars rating={r.rating} /></td>
                    <td style={{ maxWidth: 280, color: 'var(--text-secondary)', fontSize: 13 }}>
                      {r.comment ?? <em style={{ color: 'var(--text-tertiary)' }}>Tanpa komentar</em>}
                    </td>
                    <td style={{ fontSize: 13 }}>{fmtDate(r.created_at)}</td>
                    <td>
                      <span className={`status ${r.status === 'approved' ? 'active' : r.status === 'rejected' ? 'cancelled' : 'draft'}`}>
                        {STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="col-actions">
                      {r.status !== 'approved' && (
                        <button type="button" className="icon-btn primary" title="Setujui" onClick={() => doStatus(r.id, 'approved')}>
                          <AdminIcon.Check />
                        </button>
                      )}
                      {r.status !== 'rejected' && (
                        <button type="button" className="icon-btn" title="Tolak" onClick={() => doStatus(r.id, 'rejected')}>
                          <AdminIcon.X />
                        </button>
                      )}
                      <button type="button" className="icon-btn danger" title="Hapus" onClick={() => doDelete(r)}>
                        <AdminIcon.Trash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && reviews.length === 0 && (
          <div className="empty"><h4>Tidak ada ulasan</h4><p>Ulasan dari member akan muncul di sini setelah mereka submit.</p></div>
        )}
      </div>

      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg('')} />}
    </>
  );
}

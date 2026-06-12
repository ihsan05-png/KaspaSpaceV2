import { useState } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import { fetchAdminArticles, createArticle, updateArticle, deleteArticle, ApiArticle } from '../../lib/adminApi';

const CATS = ['Penghargaan', 'Produk', 'Kolaborasi', 'Komunitas', 'Tips', 'Event', 'Umum'];
const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const BLANK: Omit<ApiArticle, 'id' | 'slug' | 'created_at' | 'published_at'> = {
  title: '', excerpt: '', body: null, category: 'Umum',
  author_name: '', author_role: 'Kontributor',
  image_url: '', read_time: '3 min',
  featured: false, status: 'draft', sort_order: 0,
};

export default function AdminArticles() {
  const { data: articles, loading, refetch } = useApiGet(() => fetchAdminArticles());
  const [form, setForm]       = useState<typeof BLANK | null>(null);
  const [editId, setEditId]   = useState<number | null>(null);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');
  const [toast, setToast]     = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const openNew  = () => { setEditId(null); setForm({ ...BLANK }); };
  const openEdit = (a: ApiArticle) => {
    setEditId(a.id);
    setForm({ title: a.title, excerpt: a.excerpt, body: a.body, category: a.category,
      author_name: a.author_name, author_role: a.author_role, image_url: a.image_url ?? '',
      read_time: a.read_time, featured: a.featured, status: a.status, sort_order: a.sort_order });
  };
  const closeForm = () => { setForm(null); setEditId(null); };

  const handleSave = async () => {
    if (!form || !form.title.trim() || !form.excerpt.trim() || !form.author_name.trim()) {
      alert('Judul, excerpt, dan nama penulis wajib diisi.'); return;
    }
    setSaving(true);
    try {
      if (editId) { await updateArticle(editId, form); showToast('Artikel diperbarui.'); }
      else { await createArticle(form); showToast('Artikel dibuat.'); }
      closeForm(); refetch();
    } catch { alert('Gagal menyimpan artikel.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus artikel "${title}"?`)) return;
    await deleteArticle(id); refetch(); showToast('Artikel dihapus.');
  };

  const list = (articles ?? []).filter(a =>
    !search || `${a.title} ${a.author_name} ${a.category}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {toast && <div className="toast"><span>{toast}</span></div>}

      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Artikel</em></h1>
          <p className="admin-page-sub">Kelola konten media &amp; blog Kaspa Space</p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="btn btn-primary" onClick={openNew}>
            <AdminIcon.Plus /> Artikel Baru
          </button>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="search" placeholder="Cari judul, penulis, kategori..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <p className="panel-sub">Memuat...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Judul</th><th>Kategori</th><th>Penulis</th><th>Status</th><th>Tgl Terbit</th><th className="col-actions">Aksi</th></tr>
            </thead>
            <tbody>
              {list.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="cell-media-meta">
                      <span className="t">{a.title}</span>
                      {a.featured && <span className="status paid" style={{ fontSize: 10, padding: '2px 8px' }}>Featured</span>}
                    </div>
                  </td>
                  <td><span className="status muted">{a.category}</span></td>
                  <td>
                    <div className="cell-media-meta">
                      <span className="t">{a.author_name}</span>
                      <span className="s">{a.author_role}</span>
                    </div>
                  </td>
                  <td><span className={`status ${a.status === 'published' ? 'active' : 'archived'}`}>{a.status === 'published' ? 'Published' : 'Draft'}</span></td>
                  <td>{fmtDate(a.published_at)}</td>
                  <td className="col-actions">
                    <button type="button" className="icon-btn" title="Edit" onClick={() => openEdit(a)}><AdminIcon.Edit /></button>
                    <button type="button" className="icon-btn danger" title="Hapus" onClick={() => handleDelete(a.id, a.title)}><AdminIcon.Trash /></button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)' }}>Belum ada artikel.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p className="panel-sub order-summary">Menampilkan <strong className="count-hl">{list.length}</strong> artikel</p>

      {/* Form modal */}
      {form && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editId ? 'Edit Artikel' : 'Artikel Baru'}</h3>
              <button type="button" className="modal-close" onClick={closeForm}><AdminIcon.X /></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: 14 }}>
              <div className="field">
                <label>Judul <span className="req">*</span></label>
                <input value={form.title} onChange={e => setForm(f => f && ({ ...f, title: e.target.value }))} placeholder="Judul artikel" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => f && ({ ...f, category: e.target.value }))}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(f => f && ({ ...f, status: e.target.value as 'draft' | 'published' }))}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Excerpt <span className="req">*</span></label>
                <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => f && ({ ...f, excerpt: e.target.value }))} placeholder="Ringkasan singkat artikel" />
              </div>
              <div className="field">
                <label>URL Gambar</label>
                <input value={form.image_url ?? ''} onChange={e => setForm(f => f && ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div className="field">
                  <label>Nama Penulis <span className="req">*</span></label>
                  <input value={form.author_name} onChange={e => setForm(f => f && ({ ...f, author_name: e.target.value }))} placeholder="Nama" />
                </div>
                <div className="field">
                  <label>Peran Penulis</label>
                  <input value={form.author_role} onChange={e => setForm(f => f && ({ ...f, author_role: e.target.value }))} placeholder="Editor" />
                </div>
                <div className="field">
                  <label>Waktu Baca</label>
                  <input value={form.read_time} onChange={e => setForm(f => f && ({ ...f, read_time: e.target.value }))} placeholder="5 min" />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={form.featured} onChange={e => setForm(f => f && ({ ...f, featured: e.target.checked }))} />
                Jadikan artikel unggulan (Featured)
              </label>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-ghost" onClick={closeForm}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Buat Artikel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

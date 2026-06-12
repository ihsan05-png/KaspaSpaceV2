import { useState, useMemo } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import { apiFetch } from '../../lib/api';
import {
  ApiProductType, ApiFnbItem, ApiBizService, BizPackage, PriceTier,
  fetchProductTypes, createProductType, updateProductType, deleteProductType,
  fetchFnbItems, createFnbItem, updateFnbItem, deleteFnbItem,
  fetchBizServices, createBizService, updateBizService, deleteBizService,
} from '../../lib/adminApi';

interface ApiLocation { label: string; name: string; }

const UNITS = ['jam', 'hari', 'minggu', 'bulan', 'tahun'];
const BOOKING_TYPES = ['Share Desk', 'Private Room', 'Private Office', 'Meeting Room', 'Overtime', 'Virtual Office'];
const BLANK_TIER: PriceTier = { label: '', price: 0, unit: 'jam', booking_type: 'Share Desk' };


/* ============================================================
   TOAST
   ============================================================ */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  setTimeout(onDone, 3000);
  return (
    <div className="toast">
      <div className="toast-icon"><AdminIcon.Check /></div>
      <div>
        <div className="t">{msg}</div>
        <div className="s">Tersimpan ke database</div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB: COWORKING / PRODUCT TYPES
   ============================================================ */
/* ── Multi-Photo Upload ── */
async function uploadPhoto(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '') },
    body: fd,
  });
  const json = await res.json();
  if (!json.url) throw new Error('Upload gagal');
  return json.url as string;
}

function MultiPhotoUpload({ images, onChange, label = 'Foto Produk (opsional)' }: {
  images: string[];
  onChange: (imgs: string[]) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);

  const handleAdd = async (file: File) => {
    if (images.length >= 6) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      onChange([...images, url]);
    } catch { /* ignore */ }
    finally { setUploading(false); }
  };

  const remove = (i: number) => onChange(images.filter((_, idx) => idx !== i));

  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
        {images.map((url, i) => (
          <div key={url + i} style={{ position: 'relative', width: 96, height: 96, borderRadius: 10, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)' }}>
            <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
            {i === 0 && (
              <span style={{ position: 'absolute', top: 4, left: 4, background: 'var(--accent)', color: '#fff', fontSize: 9, padding: '1px 6px', borderRadius: 10, fontWeight: 700, letterSpacing: 0.5 }}>UTAMA</span>
            )}
            <button type="button" onClick={() => remove(i)}
              style={{ position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              title="Hapus foto"
            >×</button>
          </div>
        ))}
        {images.length < 6 && (
          <label style={{ width: 96, height: 96, borderRadius: 10, border: '2px dashed var(--border)', background: 'var(--bg-card)', cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, flexShrink: 0 }}>
            <input type="file" accept="image/*" aria-label="Tambah foto" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAdd(f); e.target.value = ''; }}
            />
            <AdminIcon.Upload style={{ width: 20, height: 20, opacity: 0.5 }} />
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.3 }}>
              {uploading ? 'Mengupload...' : 'Tambah foto'}
            </span>
          </label>
        )}
      </div>
      <div className="field-hint">Foto pertama = foto utama. Maks. 6 foto · PNG/JPG/WEBP · 5 MB</div>
    </div>
  );
}

const BLANK_PT = {
  key: '', description: '', badge: '', amenity: '', requires_documents: false, location: '',
};

function PTModal({
  initial, onClose, onSaved,
}: {
  initial: ApiProductType | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!initial;

  const initTiers = (): PriceTier[] => {
    if (initial?.prices?.length) {
      return initial.prices.map(t => ({
        ...t,
        // backward compat: derive booking_type if missing (old data used is_share_desk)
        booking_type: t.booking_type
          ?? ((t as { is_share_desk?: boolean }).is_share_desk
            ? 'Share Desk'
            : t.unit === 'jam' ? 'Private Room' : 'Private Office'),
      }));
    }
    if (initial) return [{ label: '', price: initial.suggested_price, unit: initial.unit, booking_type: 'Share Desk' }];
    return [{ ...BLANK_TIER }];
  };

  const [form, setForm] = useState(
    initial
      ? { key: initial.key, description: initial.description ?? '', badge: initial.badge ?? '', amenity: initial.amenity ?? '', requires_documents: initial.requires_documents ?? false, location: initial.location ?? '' }
      : { ...BLANK_PT }
  );
  const [ptImages, setPtImages] = useState<string[]>(initial?.images ?? []);
  const { data: locData } = useApiGet<ApiLocation[]>(() => apiFetch<ApiLocation[]>('/api/locations'));
  const availableLocs = locData ?? [];
  const [tiers, setTiers] = useState<PriceTier[]>(initTiers);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const setTier = (i: number, field: keyof PriceTier, value: string | number | boolean | undefined) =>
    setTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: value } : t));

  const addTier    = () => setTiers(prev => [...prev, { ...BLANK_TIER }]);
  const removeTier = (i: number) => setTiers(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.key.trim()) return;
    if (tiers.length === 0) { setError('Minimal 1 harga harus diisi.'); return; }
    setSaving(true); setError('');
    try {
      const body = {
        ...form,
        name:   form.key,
        images: ptImages.length ? ptImages : null,
        prices: tiers.map(t => ({ ...t, price: Number(t.price) })),
        suggested_price: Number(tiers[0].price),
        unit:            tiers[0].unit,
      };
      if (isEdit) { await updateProductType(initial!.id, body); onSaved('Tipe diperbarui'); }
      else        { await createProductType(body);              onSaved('Tipe ditambahkan'); }
      onClose();
    } catch { setError('Gagal menyimpan. Coba lagi.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!initial || !confirm(`Hapus tipe "${initial.key}"?`)) return;
    setSaving(true);
    try { await deleteProductType(initial.id); onSaved('Tipe dihapus'); onClose(); }
    catch { setError('Gagal menghapus.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
        <div className="modal-head">
          <div>
            <h3>{isEdit ? <>Edit <em>Tipe Coworking</em></> : <>Tambah <em>Tipe Coworking</em></>}</h3>
            <p className="panel-sub">Tipe ini bisa dipilih saat menambah ruangan baru.</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Tutup"><AdminIcon.X /></button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Nama Tipe</label>
            <input value={form.key} onChange={e => set('key', e.target.value)} placeholder="cth. Podcast Room" required />
          </div>

          <div className="field">
            <label>Lokasi</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {availableLocs.map(loc => (
                <label
                  key={loc.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)', background: form.location === loc.label ? 'var(--accent)' : 'transparent', color: form.location === loc.label ? '#fff' : 'var(--text-secondary)', transition: 'all .15s' }}
                >
                  <input type="radio" name="location" style={{ display: 'none' }} checked={form.location === loc.label} onChange={() => set('location', loc.label)} />
                  {loc.name}
                </label>
              ))}
              {form.location && (
                <button type="button" className="btn btn-ghost" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20 }} onClick={() => set('location', '')}>
                  ✕ Semua Lokasi
                </button>
              )}
            </div>
            <div className="field-hint">Kosongkan = tersedia di semua lokasi.</div>
          </div>

          <div className="field">
            <label>Label</label>
            <input value={form.badge} onChange={e => set('badge', e.target.value)} placeholder="cth. NEW, Promo, Best Seller" />
            <div className="field-hint">Badge kecil yang tampil di kartu produk. Kosongkan jika tidak perlu.</div>
          </div>

          <div className="field">
            <label>Deskripsi</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Jelaskan produk coworking ini secara singkat" />
          </div>

          {/* Daftar Harga Dinamis */}
          <div className="field">
            <label>Daftar Harga</label>
            <div className="field-hint" style={{ marginBottom: 8 }}>Tambah beberapa harga dengan satuan berbeda (cth. per jam, per hari, per bulan).</div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 1.5fr 70px 32px', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Nama Paket</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Harga (Rp)</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Satuan</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Tipe</span>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Bln</span>
              <span />
            </div>
            {tiers.map((tier, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 1.5fr 70px 32px', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div className="field" style={{ margin: 0, minWidth: 0 }}>
                  <input
                    placeholder="cth. Share Desk 1 Jam"
                    aria-label="Nama Paket"
                    value={tier.label}
                    onChange={e => setTier(i, 'label', e.target.value)}
                  />
                </div>
                <div className="field" style={{ margin: 0, minWidth: 0 }}>
                  <input
                    type="number" min="0" step="1000"
                    placeholder="0"
                    aria-label="Harga"
                    value={tier.price}
                    onChange={e => setTier(i, 'price', e.target.value)}
                    required
                  />
                </div>
                <div className="field" style={{ margin: 0, minWidth: 0 }}>
                  <select
                    aria-label="Satuan"
                    value={tier.unit}
                    onChange={e => setTier(i, 'unit', e.target.value)}
                  >
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0, minWidth: 0 }}>
                  <select
                    aria-label="Tipe Booking"
                    value={tier.booking_type}
                    onChange={e => setTier(i, 'booking_type', e.target.value)}
                  >
                    {BOOKING_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0, minWidth: 0 }}>
                  <input
                    type="number" min="1" max="120" step="1"
                    placeholder="—"
                    aria-label="Durasi bulan"
                    value={(tier as { duration_months?: number }).duration_months ?? ''}
                    onChange={e => setTier(i, 'duration_months', e.target.value ? Number(e.target.value) : undefined)}
                  />
                </div>
                <button
                  type="button"
                  className="icon-btn danger"
                  style={{ flexShrink: 0 }}
                  onClick={() => removeTier(i)}
                  disabled={tiers.length === 1}
                  title="Hapus"
                >
                  <AdminIcon.Trash />
                </button>
              </div>
            ))}

            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={addTier}>
              + Tambah Harga
            </button>
          </div>

          <div className="field">
            <label>Fasilitas Utama</label>
            <input value={form.amenity} onChange={e => set('amenity', e.target.value)} placeholder="cth. Soundproof, AC" />
          </div>

          <MultiPhotoUpload images={ptImages} onChange={setPtImages} />

          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.requires_documents} onChange={e => set('requires_documents', e.target.checked)} style={{ width: 16, height: 16 }} />
              <span>Butuh Unggah Dokumen saat Checkout</span>
            </label>
            <div className="field-hint">Aktifkan untuk produk yang membutuhkan KTP, NPWP, atau dokumen usaha dari pelanggan (cth. Virtual Office, Private Office).</div>
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: 13 }}>{error}</p>}
        </div>

        <div className="modal-foot">
          <div>
            {isEdit && (
              <button type="button" className="icon-btn danger" style={{ width: 'auto', padding: '0 14px', height: 38, gap: 8, display: 'inline-flex', alignItems: 'center' }} onClick={handleDelete} disabled={saving}>
                <AdminIcon.Trash /> Hapus
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Tipe'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function CoworkingTab({ onToast }: { onToast: (msg: string) => void }) {
  const { data, loading, refetch } = useApiGet<ApiProductType[]>(fetchProductTypes);
  const types = data ?? [];
  const [editing, setEditing] = useState<ApiProductType | null | undefined>(undefined);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() =>
    types.filter(t => `${t.key} ${t.description ?? ''}`.toLowerCase().includes(search.toLowerCase())),
    [types, search]
  );

  const handleSaved = (msg: string) => { onToast(msg); refetch(); };

  return (
    <>
      <div className="admin-toolbar" style={{ marginTop: 0 }}>
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="search" placeholder="Cari tipe..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing(null)}>
          + Tambah Tipe
        </button>
      </div>

      {loading ? <p className="panel-sub">Memuat tipe produk...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tipe Produk</th>
                <th>Deskripsi</th>
                <th>Harga</th>
                <th>Satuan</th>
                <th>Lokasi</th>
                <th>Fasilitas</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="col-title">
                    <div className="cell-media">
                      {t.image
                        ? <img className="cell-media-img" src={t.image} alt={t.key} loading="lazy" />
                        : <div className="cell-media-img cell-media-placeholder" />
                      }
                      <div className="cell-media-meta">
                        <span className="t">{t.key}</span>
                        <span className="s">
                          {(() => {
                            const prices = t.prices?.map(p => p.price) ?? [t.suggested_price];
                            const min = Math.min(...prices);
                            const max = Math.max(...prices);
                            const units = t.prices?.length ? [...new Set(t.prices.map(p => p.unit))].join('/') : t.unit;
                            return min === max
                              ? `Rp${min.toLocaleString('id-ID')} / ${units}`
                              : `Rp${min.toLocaleString('id-ID')} – Rp${max.toLocaleString('id-ID')} / ${units}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{t.description}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
                    {(() => {
                      const prices = t.prices?.map(p => p.price) ?? [t.suggested_price];
                      const min = Math.min(...prices);
                      const max = Math.max(...prices);
                      return min === max
                        ? `Rp${min.toLocaleString('id-ID')}`
                        : `Rp${min.toLocaleString('id-ID')} – Rp${max.toLocaleString('id-ID')}`;
                    })()}
                  </td>
                  <td style={{ fontSize: 13 }}>
                    {t.prices?.length
                      ? [...new Set(t.prices.map(p => p.unit))].join(' / ')
                      : t.unit}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {t.location ?? <span style={{ color: 'var(--text-tertiary)' }}>Semua</span>}
                  </td>
                  <td>{t.amenity}</td>
                  <td className="col-actions">
                    <button type="button" className="icon-btn" onClick={() => setEditing(t)} title="Edit">
                      <AdminIcon.Edit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty"><h4>Tidak ada tipe</h4><p>Tambah tipe coworking baru atau ubah kata pencarian.</p></div>
      )}

      {editing !== undefined && (
        <PTModal initial={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />
      )}
    </>
  );
}

/* ============================================================
   TAB: FOOD & BEVERAGE
   ============================================================ */
const FNB_CATEGORIES = ['Makanan', 'Minuman', 'Snack'];

const BLANK_FNB = { name: '', category: 'Makanan', price: 0, unit: 'porsi', location: '', description: '', status: 'available' as const };

function FnbModal({
  initial, onClose, onSaved,
}: {
  initial: ApiFnbItem | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, category: initial.category, price: initial.price, unit: initial.unit, location: initial.location ?? '', description: initial.description ?? '', status: initial.status }
      : { ...BLANK_FNB }
  );
  const [packages, setPackages]   = useState<{ name: string; price: number }[]>(initial?.packages?.length ? initial.packages : []);
  const [fnbImages, setFnbImages] = useState<string[]>(initial?.images ?? []);
  const [saving, setSaving]       = useState(false);
  const { data: fnbLocData } = useApiGet<ApiLocation[]>(() => apiFetch<ApiLocation[]>('/api/locations'));
  const fnbLocs = fnbLocData ?? [];
  const [error, setError]         = useState('');

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const setPkg = (i: number, field: 'name' | 'price', value: string | number) =>
    setPackages(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  const addPkg    = () => setPackages(prev => [...prev, { name: '', price: 0 }]);
  const removePkg = (i: number) => setPackages(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setError('');
    try {
      const body = {
        ...form,
        images:   fnbImages.length ? fnbImages : null,
        price:    packages.length ? Math.min(...packages.map(p => Number(p.price))) : Number(form.price),
        packages: packages.length ? packages.map(p => ({ ...p, price: Number(p.price) })) : null,
      };
      if (isEdit) { await updateFnbItem(initial!.id, body); onSaved('Menu diperbarui'); }
      else         { await createFnbItem(body);              onSaved('Menu ditambahkan'); }
      onClose();
    } catch { setError('Gagal menyimpan. Coba lagi.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!initial || !confirm(`Hapus menu "${initial.name}"?`)) return;
    setSaving(true);
    try { await deleteFnbItem(initial.id); onSaved('Menu dihapus'); onClose(); }
    catch { setError('Gagal menghapus.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
        <div className="modal-head">
          <div>
            <h3>{isEdit ? <>Edit <em>Menu F&amp;B</em></> : <>Tambah <em>Menu F&amp;B</em></>}</h3>
            <p className="panel-sub">Item menu yang tersedia di kafe internal Kaspa Space.</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Tutup"><AdminIcon.X /></button>
        </div>

        <div className="modal-body">
          <div className="field-row">
            <div className="field">
              <label>Nama Menu</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="cth. Cappuccino" required />
            </div>
            <div className="field">
              <label>Kategori</label>
              <select aria-label="Kategori" value={form.category} onChange={e => set('category', e.target.value)}>
                {FNB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Lokasi</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {fnbLocs.map(loc => (
                <label key={loc.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)', background: form.location === loc.label ? 'var(--accent)' : 'transparent', color: form.location === loc.label ? '#fff' : 'var(--text-secondary)', transition: 'all .15s' }}>
                  <input type="radio" name="fnb-location" style={{ display: 'none' }} checked={form.location === loc.label} onChange={() => set('location', loc.label)} />
                  {loc.name}
                </label>
              ))}
            </div>
            <div className="field-hint">Kosongkan = tersedia di semua lokasi.</div>
          </div>

          {/* Nama Paket */}
          <div className="field">
            <label>Nama Paket</label>
            <div className="field-hint" style={{ marginBottom: 8 }}>Isi jika menu punya varian harga. Kosongkan jika harga tunggal.</div>

            {packages.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ flex: 3, fontSize: 11, color: 'var(--text-tertiary)' }}>Nama Paket</span>
                <span style={{ flex: 2, fontSize: 11, color: 'var(--text-tertiary)' }}>Harga (Rp)</span>
                <span style={{ width: 32, flexShrink: 0 }} />
              </div>
            )}
            {packages.map((pkg, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div className="field" style={{ flex: 3, margin: 0 }}>
                  <input placeholder="cth. Nasi Ayam Penyet" aria-label="Nama Paket" value={pkg.name} onChange={e => setPkg(i, 'name', e.target.value)} required />
                </div>
                <div className="field" style={{ flex: 2, margin: 0 }}>
                  <input type="number" min="0" step="500" placeholder="0" aria-label="Harga" value={pkg.price} onChange={e => setPkg(i, 'price', e.target.value)} required />
                </div>
                <button type="button" className="icon-btn danger" style={{ flexShrink: 0 }} onClick={() => removePkg(i)} title="Hapus"><AdminIcon.Trash /></button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={addPkg}>+ Tambah Paket</button>
          </div>

          <div className="field">
            <label>Deskripsi</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Jelaskan item menu ini secara singkat" />
          </div>

          <MultiPhotoUpload images={fnbImages} onChange={setFnbImages} label="Foto Menu (opsional)" />

          <div className="field-row r3">
            {packages.length === 0 && (
              <div className="field">
                <label>Harga (Rp)</label>
                <input type="number" min="0" step="500" placeholder="0" value={form.price} onChange={e => set('price', Number(e.target.value))} required={packages.length === 0} />
              </div>
            )}
            <div className="field">
              <label>Satuan</label>
              <select aria-label="Satuan" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {['gelas', 'pcs', 'porsi', 'box', 'lusin'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Status</label>
              <select aria-label="Status" value={form.status} onChange={e => set('status', e.target.value as typeof form.status)}>
                <option value="available">Tersedia</option>
                <option value="habis">Habis</option>
              </select>
            </div>
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: 13 }}>{error}</p>}
        </div>

        <div className="modal-foot">
          <div>
            {isEdit && (
              <button type="button" className="icon-btn danger" style={{ width: 'auto', padding: '0 14px', height: 38, gap: 8, display: 'inline-flex', alignItems: 'center' }} onClick={handleDelete} disabled={saving}>
                <AdminIcon.Trash /> Hapus
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Menu'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FnbTab({ onToast }: { onToast: (msg: string) => void }) {
  const { data, loading, refetch } = useApiGet<ApiFnbItem[]>(fetchFnbItems);
  const items = data ?? [];
  const [editing, setEditing] = useState<ApiFnbItem | null | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const filtered = useMemo(() => items.filter(it => {
    if (catFilter !== 'Semua' && it.category !== catFilter) return false;
    if (statusFilter !== 'Semua' && it.status !== statusFilter) return false;
    if (search && !`${it.name} ${it.category} ${it.description ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, search, catFilter, statusFilter]);

  const handleSaved = (msg: string) => { onToast(msg); refetch(); };

  return (
    <>
      <div className="admin-toolbar" style={{ marginTop: 0 }}>
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="search" placeholder="Cari menu..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select aria-label="Filter kategori" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option>Semua</option>
          {FNB_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select aria-label="Filter status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>Semua</option>
          <option value="available">Tersedia</option>
          <option value="habis">Habis</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setEditing(null)}>
          + Tambah Menu
        </button>
      </div>

      {loading ? <p className="panel-sub">Memuat menu...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Menu</th>
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Harga</th>
                <th>Satuan</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(it => (
                <tr key={it.id}>
                  <td className="col-title">
                    <div className="cell-media">
                      {it.image
                        ? <img className="cell-media-img" src={it.image} alt={it.name} loading="lazy" />
                        : <div className="cell-media-img cell-media-placeholder" />
                      }
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{it.name}</span>
                    </div>
                  </td>
                  <td><span className="tag tag-default">{it.category}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{it.description}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>Rp{it.price.toLocaleString('id-ID')}</td>
                  <td>{it.unit}</td>
                  <td>
                    <span className={`status ${it.status === 'available' ? 'active' : 'archived'}`}>
                      {it.status === 'available' ? 'Tersedia' : 'Habis'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button type="button" className="icon-btn" onClick={() => setEditing(it)} title="Edit"><AdminIcon.Edit /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty"><h4>Tidak ada menu</h4><p>Tambah item menu baru atau ubah filter.</p></div>
      )}

      {editing !== undefined && (
        <FnbModal initial={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />
      )}
    </>
  );
}

/* ============================================================
   TAB: BUSINESS SERVICE
   ============================================================ */
const BIZ_CATS = ['Legalitas', 'Percetakan', 'Konsultasi', 'Administrasi', 'Umum'];
const BLANK_BIZ = { name: '', category: 'Umum', description: '', price: 0, location: '', duration: '', requires_documents: false, status: 'active' as const };

function BizModal({
  initial, onClose, onSaved,
}: {
  initial: ApiBizService | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial
      ? { name: initial.name, category: initial.category ?? 'Umum', description: initial.description ?? '', price: initial.price, location: initial.location ?? '', duration: initial.duration ?? '', requires_documents: initial.requires_documents ?? false, status: initial.status }
      : { ...BLANK_BIZ }
  );
  const [packages, setPackages]   = useState<BizPackage[]>(initial?.packages?.length ? initial.packages : []);
  const [bizPhotos, setBizPhotos] = useState<string[]>(initial?.photos ?? []);
  const [saving, setSaving]       = useState(false);
  const { data: bizLocData } = useApiGet<ApiLocation[]>(() => apiFetch<ApiLocation[]>('/api/locations'));
  const bizLocs = bizLocData ?? [];
  const [error, setError] = useState('');

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const setPkg = (i: number, field: 'name' | 'price', value: string | number) =>
    setPackages(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  const addPkg    = () => setPackages(prev => [...prev, { name: '', price: 0 }]);
  const removePkg = (i: number) => setPackages(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true); setError('');
    try {
      const body = {
        ...form,
        photos:   bizPhotos.length ? bizPhotos : null,
        price:    packages.length ? Math.min(...packages.map(p => Number(p.price))) : Number(form.price),
        packages: packages.length ? packages.map(p => ({ ...p, price: Number(p.price) })) : null,
      };
      if (isEdit) { await updateBizService(initial!.id, body); onSaved('Layanan diperbarui'); }
      else         { await createBizService(body);              onSaved('Layanan ditambahkan'); }
      onClose();
    } catch { setError('Gagal menyimpan. Coba lagi.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!initial || !confirm(`Hapus layanan "${initial.name}"?`)) return;
    setSaving(true);
    try { await deleteBizService(initial.id); onSaved('Layanan dihapus'); onClose(); }
    catch { setError('Gagal menghapus.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
        <div className="modal-head">
          <div>
            <h3>{isEdit ? <>Edit <em>Layanan Bisnis</em></> : <>Tambah <em>Layanan Bisnis</em></>}</h3>
            <p className="panel-sub">Layanan legalitas &amp; sertifikasi yang tersedia untuk member.</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Tutup"><AdminIcon.X /></button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Nama Layanan</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="cth. Pendirian PT" required />
          </div>

          <div className="field">
            <label>Kategori</label>
            <select title="Kategori" value={form.category} onChange={e => set('category', e.target.value)}>
              {BIZ_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Deskripsi</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Jelaskan layanan ini secara singkat" />
          </div>

          <div className="field">
            <label>Lokasi</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {bizLocs.map(loc => (
                <label key={loc.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '4px 12px', borderRadius: 20, border: '1px solid var(--border)', background: form.location === loc.label ? 'var(--accent)' : 'transparent', color: form.location === loc.label ? '#fff' : 'var(--text-secondary)', transition: 'all .15s' }}>
                  <input type="radio" name="biz-location" style={{ display: 'none' }} checked={form.location === loc.label} onChange={() => set('location', loc.label)} />
                  {loc.name}
                </label>
              ))}
            </div>
            <div className="field-hint">Kosongkan = tersedia di semua lokasi.</div>
          </div>

          <div className="field">
            <label>Nama Paket</label>
            <div className="field-hint" style={{ marginBottom: 8 }}>Isi jika layanan punya varian harga. Kosongkan jika harga tunggal.</div>
            {packages.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ flex: 3, fontSize: 11, color: 'var(--text-tertiary)' }}>Nama Paket</span>
                <span style={{ flex: 2, fontSize: 11, color: 'var(--text-tertiary)' }}>Harga (Rp)</span>
                <span style={{ width: 32, flexShrink: 0 }} />
              </div>
            )}
            {packages.map((pkg, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div className="field" style={{ flex: 3, margin: 0 }}>
                  <input placeholder="cth. Pendirian PT" aria-label="Nama Paket" value={pkg.name} onChange={e => setPkg(i, 'name', e.target.value)} required />
                </div>
                <div className="field" style={{ flex: 2, margin: 0 }}>
                  <input type="number" min="0" step="1" placeholder="0" aria-label="Harga" value={pkg.price} onChange={e => setPkg(i, 'price', e.target.value)} required />
                </div>
                <button type="button" className="icon-btn danger" style={{ flexShrink: 0 }} onClick={() => removePkg(i)} title="Hapus"><AdminIcon.Trash /></button>
              </div>
            ))}
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '5px 12px' }} onClick={addPkg}>+ Tambah Paket</button>
          </div>

          <MultiPhotoUpload images={bizPhotos} onChange={setBizPhotos} label="Foto Layanan (opsional)" />

          <div className="field-row">
            {packages.length === 0 && (
              <div className="field">
                <label>Harga (Rp)</label>
                <input type="number" min="0" step="1" placeholder="0" value={form.price} onChange={e => set('price', Number(e.target.value))} required={packages.length === 0} />
              </div>
            )}
            <div className="field">
              <label>Estimasi Durasi</label>
              <input value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="cth. 14 hari kerja" />
            </div>
            <div className="field">
              <label>Status</label>
              <select aria-label="Status" value={form.status} onChange={e => set('status', e.target.value as typeof form.status)}>
                <option value="active">Aktif</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.requires_documents} onChange={e => set('requires_documents', e.target.checked)} style={{ width: 16, height: 16 }} />
              <span>Butuh Unggah Dokumen saat Checkout</span>
            </label>
            <div className="field-hint">Aktifkan untuk layanan yang membutuhkan KTP, NPWP, atau dokumen usaha dari pelanggan.</div>
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: 13 }}>{error}</p>}
        </div>

        <div className="modal-foot">
          <div>
            {isEdit && (
              <button type="button" className="icon-btn danger" style={{ width: 'auto', padding: '0 14px', height: 38, gap: 8, display: 'inline-flex', alignItems: 'center' }} onClick={handleDelete} disabled={saving}>
                <AdminIcon.Trash /> Hapus
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Layanan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function BizTab({ onToast }: { onToast: (msg: string) => void }) {
  const { data, loading, refetch } = useApiGet<ApiBizService[]>(fetchBizServices);
  const items = data ?? [];
  const [editing, setEditing] = useState<ApiBizService | null | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const filtered = useMemo(() => items.filter(it => {
    if (statusFilter !== 'Semua' && it.status !== statusFilter) return false;
    if (search && !`${it.name} ${it.description ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, search, statusFilter]);

  const handleSaved = (msg: string) => { onToast(msg); refetch(); };

  return (
    <>
      <div className="admin-toolbar" style={{ marginTop: 0 }}>
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input className="search" placeholder="Cari layanan..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select aria-label="Filter status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>Semua</option>
          <option value="active">Aktif</option>
          <option value="draft">Draft</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setEditing(null)}>
          + Tambah Layanan
        </button>
      </div>

      {loading ? <p className="panel-sub">Memuat layanan...</p> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nama Layanan</th>
                <th>Deskripsi</th>
                <th>Harga</th>
                <th>Lokasi</th>
                <th>Estimasi</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(it => (
                <tr key={it.id}>
                  <td className="col-title">
                    <div className="cell-media">
                      {it.photo
                        ? <img className="cell-media-img" src={it.photo} alt={it.name} loading="lazy" />
                        : <div className="cell-media-img cell-media-placeholder" />
                      }
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{it.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{it.description}</td>
                  <td style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>Rp{it.price.toLocaleString('id-ID')}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{it.location ?? '—'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{it.duration ?? '—'}</td>
                  <td>
                    <span className={`status ${it.status === 'active' ? 'active' : 'draft'}`}>
                      {it.status === 'active' ? 'Aktif' : 'Draft'}
                    </span>
                  </td>
                  <td className="col-actions">
                    <button type="button" className="icon-btn" onClick={() => setEditing(it)} title="Edit"><AdminIcon.Edit /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="empty"><h4>Tidak ada layanan</h4><p>Tambah layanan bisnis baru atau ubah filter.</p></div>
      )}

      {editing !== undefined && (
        <BizModal initial={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />
      )}
    </>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
type Tab = 'coworking' | 'fnb' | 'biz';

const TAB_LABELS: Record<Tab, string> = {
  coworking: 'Coworking',
  fnb:       'Food & Beverage',
  biz:       'Business Service',
};

export default function AdminProducts() {
  const [tab, setTab] = useState<Tab>('coworking');
  const [toastMsg, setToastMsg] = useState('');

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Produk</em></h1>
          <p className="admin-page-sub">Kelola semua produk dan layanan Kaspa Space.</p>
        </div>
      </div>

      <div className="prod-tabs">
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
          <button
            key={t}
            type="button"
            className={`prod-tab${tab === t ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 0 }}>
        {tab === 'coworking' && <CoworkingTab onToast={setToastMsg} />}
        {tab === 'fnb'       && <FnbTab       onToast={setToastMsg} />}
        {tab === 'biz'       && <BizTab       onToast={setToastMsg} />}
      </div>

      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg('')} />}
    </>
  );
}

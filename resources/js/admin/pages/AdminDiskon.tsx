import { useState, useMemo } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import {
  ApiDiscount, DiscountProduct, ApiUser,
  fetchDiscounts, createDiscount, updateDiscount, deleteDiscount,
  fetchProductTypes, ApiProductType,
  fetchFnbItems, ApiFnbItem,
  fetchBizServices, ApiBizService,
  fetchUsers,
} from '../../lib/adminApi';

/* ── Helpers ── */
const fmt     = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');
const fmtDate = (s: string | null) =>
  s ? new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const PRESET_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#0ea5e9','#ef4444','#14b8a6'];

const BLANK: Omit<ApiDiscount, 'id' | 'used_count' | 'sort_order'> = {
  code: '', name: '', description: '', type: 'percentage', value: 10,
  min_order: 0, max_discount: null, quota: null,
  valid_from: '', valid_until: '',
  applicable_to: [], user_ids: [],
  color: '#6366f1', status: 'active',
};

/* ── Download PNG ── */
function downloadCardPng(d: Partial<ApiDiscount>) {
  const W = 600, H = 280;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const color = d.color || '#6366f1';

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, color + 'ee');
  grad.addColorStop(1, color + '88');
  ctx.beginPath();
  (ctx as any).roundRect?.(0, 0, W, H, 20) ?? ctx.rect(0, 0, W, H);
  ctx.fillStyle = grad;
  ctx.fill();

  // Decorative circles
  ctx.beginPath(); ctx.arc(W + 20, -20, 110, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
  ctx.beginPath(); ctx.arc(W - 30, H + 20, 90, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();

  // Label
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.letterSpacing = '1px';
  ctx.fillText('PROMO KASPA SPACE', 28, 44);

  // Value
  const valueLabel = d.type === 'percentage'
    ? `${d.value ?? 0}% OFF`
    : `Hemat ${fmt(d.value ?? 0)}`;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = '0px';
  ctx.fillText(valueLabel, 28, 108);

  // Name
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.fillText(d.name || 'Nama Diskon', 28, 138);

  if (d.description) {
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(d.description, 28, 162);
  }

  // Code box
  ctx.beginPath();
  (ctx as any).roundRect?.(28, H - 56, 170, 34, 8) ?? ctx.rect(28, H - 56, 170, 34);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.fill();
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.letterSpacing = '3px';
  ctx.fillText(d.code || 'KODE', 44, H - 33);

  // Valid until
  if (d.valid_until) {
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.letterSpacing = '0px';
    ctx.textAlign = 'right';
    ctx.fillText(`s/d ${fmtDate(d.valid_until)}`, W - 28, H - 36);
  }

  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `diskon-${d.code || 'promo'}.png`;
    a.click(); URL.revokeObjectURL(url);
  }, 'image/png');
}

/* ── Card Preview ── */
function DiscountCardPreview({ d }: { d: Partial<ApiDiscount> }) {
  const bg = d.color || '#6366f1';
  const valueLabel = d.type === 'percentage' ? `${d.value ?? 0}% OFF` : `Hemat ${fmt(d.value ?? 0)}`;
  return (
    <div style={{ borderRadius: 14, padding: '20px 24px', background: `linear-gradient(135deg, ${bg}ee, ${bg}88)`, color: '#fff', position: 'relative', overflow: 'hidden', minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ position: 'absolute', right: -20, top: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div>
        <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Promo Kaspa Space</div>
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{valueLabel}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>{d.name || 'Nama Promo'}</div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 6, padding: '4px 12px', fontFamily: 'monospace', fontSize: 14, fontWeight: 700, letterSpacing: 2 }}>
          {d.code || 'KODE'}
        </div>
        <div style={{ fontSize: 11, opacity: 0.75 }}>
          {d.valid_until ? `s/d ${fmtDate(d.valid_until)}` : 'Tanpa batas'}
        </div>
      </div>
    </div>
  );
}

/* ── Product Picker ── */
interface ProductOption { cat: 'coworking' | 'fnb' | 'biz'; id: string | number; name: string; location?: string | null; }

function ProductPicker({ selected, onChange }: {
  selected: DiscountProduct[];
  onChange: (v: DiscountProduct[]) => void;
}) {
  const { data: pts  } = useApiGet<ApiProductType[]>(fetchProductTypes);
  const { data: fnbs } = useApiGet<ApiFnbItem[]>(fetchFnbItems);
  const { data: bizs } = useApiGet<ApiBizService[]>(fetchBizServices);
  const [search, setSearch] = useState('');

  const options: ProductOption[] = [
    ...(pts  ?? []).map(p => ({ cat: 'coworking' as const, id: p.key, name: p.name ?? p.key, location: p.location })),
    ...(fnbs ?? []).map(p => ({ cat: 'fnb'       as const, id: p.id,  name: p.name,          location: p.location })),
    ...(bizs ?? []).map(p => ({ cat: 'biz'       as const, id: p.id,  name: p.name,          location: p.location })),
  ];

  const filtered = search
    ? options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()))
    : options;

  const isSelected = (o: ProductOption) =>
    selected.some(s => s.cat === o.cat && String(s.id) === String(o.id));

  const toggle = (o: ProductOption) => {
    if (isSelected(o)) {
      onChange(selected.filter(s => !(s.cat === o.cat && String(s.id) === String(o.id))));
    } else {
      onChange([...selected, { cat: o.cat, id: o.id, name: o.name }]);
    }
  };

  const catLabel: Record<string, string> = { coworking: 'Coworking', fnb: 'F&B', biz: 'Bisnis' };

  const grouped = (['coworking', 'fnb', 'biz'] as const).map(cat => ({
    cat, label: catLabel[cat],
    items: filtered.filter(o => o.cat === cat),
  })).filter(g => g.items.length > 0);

  return (
    <div>
      <input
        placeholder="Cari produk..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 8, width: '100%' }}
      />
      <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        {grouped.length === 0 && (
          <div style={{ padding: 12, color: 'var(--text-tertiary)', fontSize: 13 }}>Tidak ada produk ditemukan.</div>
        )}
        {grouped.map(g => (
          <div key={g.cat}>
            <div style={{ padding: '6px 12px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-tertiary)', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>{g.label}</div>
            {g.items.map(o => (
              <label key={`${o.cat}:${o.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle, var(--border))', background: isSelected(o) ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                <input type="checkbox" checked={isSelected(o)} onChange={() => toggle(o)} style={{ width: 14, height: 14, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13 }}>{o.name}</div>
                  {o.location && <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>{o.location}</div>}
                </div>
              </label>
            ))}
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {selected.map(s => (
            <span key={`${s.cat}:${s.id}`} style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              {s.name}
              <button type="button" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }} onClick={() => toggle({ cat: s.cat, id: s.id, name: s.name })}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="field-hint">Kosong = berlaku untuk semua produk.</div>
    </div>
  );
}

/* ── User Picker ── */
function UserPicker({ selected, onChange }: {
  selected: number[];
  onChange: (v: number[]) => void;
}) {
  const { data: res } = useApiGet<{ data: ApiUser[]; total: number }>(fetchUsers);
  const users = res?.data ?? [];
  const [search, setSearch] = useState('');

  const filtered = search
    ? users.filter(u => `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase()))
    : users;

  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  const selectedUsers = users.filter(u => selected.includes(u.id));

  return (
    <div>
      <input
        placeholder="Cari nama atau email akun..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 8, width: '100%' }}
      />
      <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 12, color: 'var(--text-tertiary)', fontSize: 13 }}>Tidak ada akun ditemukan.</div>
        )}
        {filtered.map(u => (
          <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle, var(--border))', background: selected.includes(u.id) ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
            <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} style={{ width: 14, height: 14, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{u.email}</div>
            </div>
          </label>
        ))}
      </div>
      {selectedUsers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {selectedUsers.map(u => (
            <span key={u.id} style={{ fontSize: 12, padding: '2px 10px', borderRadius: 20, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              {u.name}
              <button type="button" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }} onClick={() => toggle(u.id)}>×</button>
            </span>
          ))}
        </div>
      )}
      <div className="field-hint">Kosong = berlaku untuk semua akun.</div>
    </div>
  );
}

/* ── Toast ── */
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  setTimeout(onDone, 3000);
  return (
    <div className="toast">
      <div className="toast-icon"><AdminIcon.Check /></div>
      <div><div className="t">{msg}</div><div className="s">Tersimpan ke database</div></div>
    </div>
  );
}

/* ── Modal ── */
function DiskonModal({ initial, onClose, onSaved }: {
  initial: ApiDiscount | null;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<typeof BLANK>(
    initial ? {
      code: initial.code, name: initial.name, description: initial.description ?? '',
      type: initial.type, value: initial.value, min_order: initial.min_order,
      max_discount: initial.max_discount, quota: initial.quota,
      valid_from: initial.valid_from ?? '', valid_until: initial.valid_until ?? '',
      applicable_to: initial.applicable_to ?? [],
      user_ids: initial.user_ids ?? [],
      color: initial.color, status: initial.status as 'active' | 'draft',
    } : { ...BLANK }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    setSaving(true); setError('');
    try {
      const body = {
        ...form,
        code:         form.code.toUpperCase().trim(),
        value:        Number(form.value),
        min_order:    Number(form.min_order),
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        quota:        form.quota ? Number(form.quota) : null,
        valid_from:   form.valid_from  || null,
        valid_until:  form.valid_until || null,
        applicable_to: form.applicable_to?.length ? form.applicable_to : null,
        user_ids:     form.user_ids?.length ? form.user_ids : null,
      };
      if (isEdit) { await updateDiscount(initial!.id, body); onSaved('Diskon diperbarui'); }
      else        { await createDiscount(body);               onSaved('Diskon ditambahkan'); }
      onClose();
    } catch (err: any) {
      const msg = err?.errors?.code?.[0] ?? 'Gagal menyimpan. Coba lagi.';
      setError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!initial || !confirm(`Hapus diskon "${initial.code}"?`)) return;
    setSaving(true);
    try { await deleteDiscount(initial.id); onSaved('Diskon dihapus'); onClose(); }
    catch { setError('Gagal menghapus.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()} onSubmit={handleSave}>
        <div className="modal-head">
          <div>
            <h3>{isEdit ? <>Edit <em>Diskon</em></> : <>Tambah <em>Diskon</em></>}</h3>
            <p className="panel-sub">Buat kode promo yang bisa dipakai member saat checkout.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}
              onClick={() => downloadCardPng({ ...form, code: form.code || 'PROMO' })}>
              ↓ Unduh PNG
            </button>
            <button type="button" className="close" onClick={onClose} aria-label="Tutup"><AdminIcon.X /></button>
          </div>
        </div>

        <div className="modal-body">
          {/* Preview */}
          <div className="field">
            <label>Preview Kartu</label>
            <DiscountCardPreview d={form} />
          </div>

          {/* Kode & Nama */}
          <div className="field-row">
            <div className="field">
              <label>Kode Promo <span style={{ color: 'var(--error)' }}>*</span></label>
              <input
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="cth. KASPA20"
                style={{ fontFamily: 'monospace', letterSpacing: 2 }}
                required
              />
            </div>
            <div className="field">
              <label>Nama Diskon <span style={{ color: 'var(--error)' }}>*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="cth. Diskon Member Baru" required />
            </div>
          </div>

          <div className="field">
            <label>Deskripsi</label>
            <input value={form.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Jelaskan syarat promo secara singkat" />
          </div>

          {/* Tipe & Nilai */}
          <div className="field-row r3">
            <div className="field">
              <label>Tipe Diskon</label>
              <select aria-label="Tipe" value={form.type} onChange={e => set('type', e.target.value as 'percentage' | 'fixed')}>
                <option value="percentage">Persentase (%)</option>
                <option value="fixed">Nominal Tetap (Rp)</option>
              </select>
            </div>
            <div className="field">
              <label>{form.type === 'percentage' ? 'Besar Diskon (%)' : 'Nilai Diskon (Rp)'}</label>
              <input type="number" min="1" max={form.type === 'percentage' ? 100 : undefined} step={form.type === 'percentage' ? 1 : 1000} aria-label={form.type === 'percentage' ? 'Besar Diskon (%)' : 'Nilai Diskon (Rp)'} value={form.value} onChange={e => set('value', Number(e.target.value))} required />
            </div>
            {form.type === 'percentage' && (
              <div className="field">
                <label>Maks. Diskon (Rp, opsional)</label>
                <input type="number" min="0" step="5000" placeholder="Kosong = bebas" value={form.max_discount ?? ''} onChange={e => set('max_discount', e.target.value ? Number(e.target.value) : null)} />
              </div>
            )}
          </div>

          {/* Min order & Kuota */}
          <div className="field-row">
            <div className="field">
              <label>Minimum Order (Rp)</label>
              <input type="number" min="0" step="10000" aria-label="Minimum Order (Rp)" value={form.min_order} onChange={e => set('min_order', Number(e.target.value))} />
            </div>
            <div className="field">
              <label>Kuota Pemakaian (opsional)</label>
              <input type="number" min="1" placeholder="Kosong = tidak terbatas" value={form.quota ?? ''} onChange={e => set('quota', e.target.value ? Number(e.target.value) : null)} />
            </div>
          </div>

          {/* Masa berlaku */}
          <div className="field-row">
            <div className="field">
              <label>Berlaku Dari</label>
              <input type="date" aria-label="Berlaku Dari" value={form.valid_from ?? ''} onChange={e => set('valid_from', e.target.value)} />
            </div>
            <div className="field">
              <label>Berlaku Sampai</label>
              <input type="date" aria-label="Berlaku Sampai" value={form.valid_until ?? ''} onChange={e => set('valid_until', e.target.value)} />
            </div>
          </div>

          {/* Berlaku untuk produk */}
          <div className="field">
            <label>Berlaku untuk Produk</label>
            <ProductPicker
              selected={form.applicable_to ?? []}
              onChange={v => set('applicable_to', v)}
            />
          </div>

          {/* Berlaku untuk akun */}
          <div className="field">
            <label>Berlaku untuk Akun</label>
            <UserPicker
              selected={form.user_ids ?? []}
              onChange={v => set('user_ids', v)}
            />
          </div>

          {/* Warna */}
          <div className="field">
            <label>Warna Kartu</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" title={c}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '2px solid transparent', boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none', cursor: 'pointer', flexShrink: 0 }}
                  onClick={() => set('color', c)}
                />
              ))}
              <input type="color" value={form.color} onChange={e => set('color', e.target.value)}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
                title="Warna kustom"
              />
            </div>
          </div>

          {/* Status */}
          <div className="field">
            <label>Status</label>
            <select aria-label="Status" value={form.status} onChange={e => set('status', e.target.value as 'active' | 'draft')}>
              <option value="active">Aktif</option>
              <option value="draft">Draft</option>
            </select>
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
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Diskon'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminDiskon() {
  const { data, loading, refetch } = useApiGet<ApiDiscount[]>(fetchDiscounts);
  const items = data ?? [];
  const [editing, setEditing]     = useState<ApiDiscount | null | undefined>(undefined);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [toastMsg, setToastMsg]   = useState('');

  const filtered = useMemo(() => items.filter(d => {
    if (statusFilter !== 'Semua' && d.status !== statusFilter) return false;
    if (search && !`${d.code} ${d.name} ${d.description ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [items, search, statusFilter]);

  const handleSaved = (msg: string) => { setToastMsg(msg); refetch(); };

  const isActive = (d: ApiDiscount) => {
    if (d.status !== 'active') return false;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (d.valid_from  && today < new Date(d.valid_from))  return false;
    if (d.valid_until && today > new Date(d.valid_until)) return false;
    if (d.quota !== null && d.used_count >= (d.quota ?? Infinity)) return false;
    return true;
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Diskon</em></h1>
          <p className="admin-page-sub">Buat &amp; kelola kode promo untuk member.</p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-toolbar" style={{ marginTop: 0 }}>
          <div className="search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input className="search" placeholder="Cari kode atau nama diskon..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select aria-label="Filter status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>Semua</option>
            <option value="active">Aktif</option>
            <option value="draft">Draft</option>
          </select>
          <button type="button" className="btn btn-primary" onClick={() => setEditing(null)}>
            + Tambah Diskon
          </button>
        </div>

        {loading ? <p className="panel-sub">Memuat diskon...</p> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama</th>
                  <th>Nilai</th>
                  <th>Produk</th>
                  <th>Akun</th>
                  <th>Kuota</th>
                  <th>Masa Berlaku</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0, display: 'inline-block' }} />
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 1, color: 'var(--text-primary)' }}>{d.code}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{d.name}</td>
                    <td style={{ fontWeight: 600 }}>
                      {d.type === 'percentage' ? `${d.value}%` : fmt(d.value)}
                      {d.max_discount ? <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 4 }}>maks.{fmt(d.max_discount)}</span> : null}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {d.applicable_to?.length
                        ? `${d.applicable_to.length} produk`
                        : 'Semua'}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {d.user_ids?.length ? `${d.user_ids.length} akun` : 'Semua'}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {d.quota ? `${d.used_count}/${d.quota}` : `${d.used_count}/∞`}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      {d.valid_from || d.valid_until
                        ? `${fmtDate(d.valid_from)} — ${fmtDate(d.valid_until)}`
                        : 'Tanpa batas'}
                    </td>
                    <td>
                      <span className={`status ${isActive(d) ? 'active' : d.status === 'draft' ? 'draft' : 'archived'}`}>
                        {isActive(d) ? 'Aktif' : d.status === 'draft' ? 'Draft' : 'Habis/Expired'}
                      </span>
                    </td>
                    <td className="col-actions">
                      <button type="button" className="icon-btn" title="Unduh PNG" onClick={() => downloadCardPng(d)}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </button>
                      <button type="button" className="icon-btn" onClick={() => setEditing(d)} title="Edit"><AdminIcon.Edit /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty"><h4>Tidak ada diskon</h4><p>Tambah kode promo baru untuk member.</p></div>
        )}
      </div>

      {editing !== undefined && (
        <DiskonModal initial={editing} onClose={() => setEditing(undefined)} onSaved={handleSaved} />
      )}

      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg('')} />}
    </>
  );
}

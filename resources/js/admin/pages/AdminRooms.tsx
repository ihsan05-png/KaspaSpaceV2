import { useState, useMemo } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import {
  ApiRoom, ApiProductType,
  fetchRooms, createRoom, updateRoom, deleteRoom,
  addDesk, updateDesk, removeDesk,
  fetchProductTypes,
} from '../../lib/adminApi';
import { ApiError } from '../../lib/api';
import { typeClass } from '../data';

/* ============================================================
   CONSTANTS
   ============================================================ */
const LOCATIONS = [
  'Manahan, Solo',
  'Citraland, Surabaya',
  'Sinarmas, Surabaya',
  'Pakuwon, Surabaya',
];

const DESK_STATUS_CYCLE = ['available', 'occupied', 'maintenance'] as const;
const DESK_STATUS_LABEL: Record<string, string> = {
  available: 'Tersedia',
  occupied: 'Terpakai',
  maintenance: 'Maintenance',
};

/* ============================================================
   TYPES
   ============================================================ */
interface DeskDraft {
  id?: number;
  number: string;
  status: string;
}

interface RoomForm {
  title: string;
  location: string;
  price: number;
  unit: string;
  capacity: string;
  amenity: string;
  badge: string;
  featured: boolean;
  status: 'active' | 'draft' | 'archived';
  selectedKeys: string[];
  desks: DeskDraft[];
}

function blankForm(): RoomForm {
  return {
    title: '',
    location: LOCATIONS[0],
    price: 0,
    unit: 'hari',
    capacity: '',
    amenity: '',
    badge: '',
    featured: false,
    status: 'active',
    selectedKeys: [],
    desks: [],
  };
}

function roomToForm(room: ApiRoom): RoomForm {
  return {
    title: room.title,
    location: room.location,
    price: room.price,
    unit: room.unit,
    capacity: room.capacity ?? '',
    amenity: room.amenity ?? '',
    badge: room.badge ?? '',
    featured: room.featured,
    status: room.status as RoomForm['status'],
    selectedKeys: [...room.products],
    desks: room.desks.map(d => ({ id: d.id, number: d.number, status: d.status })),
  };
}

/* ============================================================
   TYPE ICON
   ============================================================ */


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
        <div className="s">Perubahan tersimpan ke database</div>
      </div>
    </div>
  );
}

/* ============================================================
   ROOM EDITOR MODAL
   ============================================================ */
interface RoomEditorProps {
  initial: ApiRoom | null;
  productTypes: ApiProductType[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}

function RoomEditor({ initial, productTypes, onClose, onSaved }: RoomEditorProps) {
  const isEdit = !!initial;
  const [form, setForm] = useState<RoomForm>(initial ? roomToForm(initial) : blankForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof RoomForm>(k: K, v: RoomForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const toggleKey = (key: string) => {
    setForm(f => {
      const has = f.selectedKeys.includes(key);
      const keys = has ? f.selectedKeys.filter(k => k !== key) : [...f.selectedKeys, key];
      if (!has && f.selectedKeys.length === 0) {
        const pt = productTypes.find(t => t.key === key);
        return {
          ...f,
          selectedKeys: keys,
          unit:     f.unit     || pt?.unit     || 'hari',
          capacity: f.capacity || pt?.capacity || '',
          amenity:  f.amenity  || pt?.amenity  || '',
          price:    pt?.suggested_price || 0,
        };
      }
      return { ...f, selectedKeys: keys };
    });
  };

  const addDeskLocal = () => {
    const n = form.desks.length + 1;
    set('desks', [...form.desks, { number: `M${n}`, status: 'available' }]);
  };

  const removeDeskLocal = (idx: number) =>
    set('desks', form.desks.filter((_, i) => i !== idx));

  const cycleDeskLocal = (idx: number) => {
    const desk = form.desks[idx];
    const cur = DESK_STATUS_CYCLE.indexOf(desk.status as typeof DESK_STATUS_CYCLE[number]);
    const next = DESK_STATUS_CYCLE[(cur + 1) % DESK_STATUS_CYCLE.length];
    set('desks', form.desks.map((d, i) => i === idx ? { ...d, status: next } : d));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || form.selectedKeys.length === 0) {
      setError('Nama ruangan dan minimal 1 produk harus diisi.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const productTypeIds = productTypes
        .filter(pt => form.selectedKeys.includes(pt.key))
        .map(pt => pt.id);

      const body = {
        title:            form.title,
        location:         form.location,
        price:            Number(form.price),
        unit:             form.unit,
        capacity:         form.capacity || null,
        amenity:          form.amenity  || null,
        badge:            form.badge    || null,
        featured:         form.featured,
        status:           form.status,
        product_type_ids: productTypeIds,
      };

      const saved = isEdit
        ? await updateRoom(initial!.id, body)
        : await createRoom(body);

      const roomId = saved.id;
      const originalDesks = initial?.desks ?? [];

      // Delete removed existing desks
      const currentExistingIds = form.desks.filter(d => d.id).map(d => d.id!);
      for (const orig of originalDesks) {
        if (!currentExistingIds.includes(orig.id)) {
          await removeDesk(roomId, orig.id);
        }
      }

      // Update status-changed existing desks
      for (const desk of form.desks) {
        if (desk.id) {
          const orig = originalDesks.find(d => d.id === desk.id);
          if (orig && orig.status !== desk.status) {
            await updateDesk(roomId, desk.id, { status: desk.status });
          }
        }
      }

      // Add new desks
      for (const desk of form.desks) {
        if (!desk.id) {
          await addDesk(roomId, { number: desk.number, status: desk.status });
        }
      }

      onSaved(isEdit ? 'Ruangan diperbarui' : 'Ruangan ditambahkan');
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        const firstFieldError = err.data.errors ? Object.values(err.data.errors)[0]?.[0] : null;
        setError(firstFieldError ?? err.message ?? 'Gagal menyimpan.');
      } else {
        setError('Gagal menyimpan. Periksa koneksi dan coba lagi.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initial) return;
    if (!confirm(`Hapus "${initial.title}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setSaving(true);
    try {
      await deleteRoom(initial.id);
      onSaved('Ruangan dihapus');
      onClose();
    } catch {
      setError('Gagal menghapus ruangan.');
    } finally {
      setSaving(false);
    }
  };

  const availableCount = form.desks.filter(d => d.status === 'available').length;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal modal-wide" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
        <div className="modal-head">
          <div>
            <h3>{isEdit ? <>Edit <em>Ruangan</em></> : <>Tambah <em>Ruangan</em></>}</h3>
            <p className="panel-sub">Perubahan langsung tersimpan ke database.</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Tutup">
            <AdminIcon.X />
          </button>
        </div>

        <div className="modal-body">
          {/* Name */}
          <div className="field">
            <label>Nama Ruangan</label>
            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="cth. Share Desk Lt. 3" required />
          </div>

          {/* Product picker + Location */}
          <div className="field-row">
            <div className="field">
              <label>
                Produk Coworking
                {form.selectedKeys.length > 0 && (
                  <span className="field-badge">{form.selectedKeys.length} dipilih</span>
                )}
              </label>
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', maxHeight: 160, overflowY: 'auto' }}>
                {productTypes.filter(t => !t.no_room).map(t => {
                  const checked = form.selectedKeys.includes(t.key);
                  return (
                    <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)', background: checked ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
                      <input type="checkbox" checked={checked} onChange={() => toggleKey(t.key)} style={{ width: 14, height: 14, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name ?? t.key}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{t.location ?? 'Semua lokasi'}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
              {form.selectedKeys.length === 0 && (
                <span className="auth-field-error">Pilih minimal satu produk.</span>
              )}
            </div>
            <div className="field">
              <label>Status</label>
              <select aria-label="Status" value={form.status} onChange={e => set('status', e.target.value as RoomForm['status'])}>
                <option value="active">Aktif</option>
                <option value="draft">Draft</option>
                <option value="archived">Diarsip</option>
              </select>
            </div>
          </div>

          {/* Desk management */}
          <div className="field">
            <label>
              Manajemen Meja
              <span className="field-badge">{availableCount}/{form.desks.length} tersedia</span>
            </label>
            <div className="desk-grid">
              {form.desks.map((d, idx) => (
                <div key={idx} className={`desk-chip desk-${d.status}`}>
                  <button
                    type="button"
                    className="desk-chip-status"
                    onClick={() => cycleDeskLocal(idx)}
                    title={`${DESK_STATUS_LABEL[d.status]} — klik untuk ganti`}
                  >
                    {d.number}
                    <span className="desk-chip-dot" />
                  </button>
                  <button
                    type="button"
                    className="desk-chip-remove"
                    onClick={() => removeDeskLocal(idx)}
                    aria-label="Hapus meja"
                  >
                    <AdminIcon.X />
                  </button>
                </div>
              ))}
              <button type="button" className="desk-add-btn" onClick={addDeskLocal}>
                <AdminIcon.Plus /> Tambah Meja
              </button>
            </div>
            <div className="field-hint">
              Klik nomor meja untuk ganti status: <strong>Tersedia → Terpakai → Maintenance</strong>.
            </div>
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: 13 }}>{error}</p>}
        </div>

        <div className="modal-foot">
          <div>
            {isEdit && (
              <button
                type="button"
                className="icon-btn danger"
                style={{ width: 'auto', padding: '0 14px', height: 38, gap: 8, display: 'inline-flex', alignItems: 'center' }}
                onClick={handleDelete}
                disabled={saving}
              >
                <AdminIcon.Trash /> Hapus
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Ruangan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   ROOM TABLE
   ============================================================ */
function RoomTable({ rooms, onEdit }: { rooms: ApiRoom[]; onEdit: (r: ApiRoom) => void }) {
  if (!rooms.length) {
    return (
      <div className="empty">
        <h4>Belum ada ruangan</h4>
        <p>Tidak ada ruangan yang sesuai filter. Coba reset atau tambah ruangan baru.</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ruangan</th>
            <th>Produk</th>
            <th>Lokasi</th>
            <th>Harga</th>
            <th>Meja</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.id}>
              <td className="col-title">
                <div className="cell-media-meta">
                  <span className="t">{r.title}</span>
                  <span className="s">
                    #{r.id}
                    {r.badge && <><span className="dot-divider"> · </span>{r.badge}</>}
                  </span>
                </div>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {r.products.slice(0, 2).map(p => (
                    <span key={p} className={`tag ${typeClass(p)}`}>{p}</span>
                  ))}
                  {r.products.length > 2 && (
                    <span className="tag tag-default">+{r.products.length - 2}</span>
                  )}
                </div>
              </td>
              <td>{r.location}</td>
              <td style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', fontWeight: 600 }}>
                Rp{r.price.toLocaleString('id-ID')}
                <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: 12 }}> / {r.unit}</span>
              </td>
              <td>
                {r.desks_total > 0 ? (
                  <span className="desk-summary">
                    <span className="desk-summary-avail">{r.desks_avail}</span>
                    <span className="desk-summary-sep">/</span>
                    {r.desks_total}
                  </span>
                ) : (
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>—</span>
                )}
              </td>
              <td>
                <span className={`status ${r.status}`}>
                  {r.status === 'active' ? 'Aktif' : r.status === 'draft' ? 'Draft' : 'Diarsip'}
                </span>
              </td>
              <td className="col-actions">
                <button type="button" className="icon-btn" onClick={() => onEdit(r)} title="Edit">
                  <AdminIcon.Edit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function AdminRooms() {
  const { data: rooms, loading, refetch } = useApiGet<ApiRoom[]>(fetchRooms);
  const { data: productTypes } = useApiGet<ApiProductType[]>(fetchProductTypes);

  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [locFilter, setLocFilter]   = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [editing, setEditing]       = useState<ApiRoom | null | undefined>(undefined);
  const [toastMsg, setToastMsg]     = useState('');

  const roomList = rooms ?? [];
  const ptList   = productTypes ?? [];

  const filtered = useMemo(() => roomList.filter(r => {
    if (typeFilter !== 'Semua' && !r.products.includes(typeFilter)) return false;
    if (locFilter !== 'Semua' && r.location !== locFilter) return false;
    if (statusFilter !== 'Semua' && r.status !== statusFilter) return false;
    if (search && !`${r.title} ${r.location} ${r.products.join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [roomList, search, typeFilter, locFilter, statusFilter]);

  const uniqueLocations = useMemo(() => [...new Set(roomList.map(r => r.location))], [roomList]);

  const handleSaved = (msg: string) => {
    setToastMsg(msg);
    refetch();
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Ruangan</em></h1>
          <p className="admin-page-sub">{loading ? '—' : `${roomList.length} ruangan terdaftar`}</p>
        </div>
        <div className="admin-page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setEditing(null)}>
            + Tambah Ruangan
          </button>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search"
            placeholder="Cari nama, lokasi, atau produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select aria-label="Filter produk" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option>Semua</option>
          {ptList.map(t => <option key={t.key}>{t.key}</option>)}
        </select>
        <select aria-label="Filter lokasi" value={locFilter} onChange={e => setLocFilter(e.target.value)}>
          <option>Semua</option>
          {uniqueLocations.map(l => <option key={l}>{l}</option>)}
        </select>
        <select aria-label="Filter status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>Semua</option>
          <option value="active">Aktif</option>
          <option value="draft">Draft</option>
          <option value="archived">Diarsip</option>
        </select>
      </div>

      {loading
        ? <p className="panel-sub">Memuat ruangan...</p>
        : <RoomTable rooms={filtered} onEdit={r => setEditing(r)} />
      }

      <p className="panel-sub" style={{ marginTop: -6 }}>
        Menampilkan <strong style={{ color: 'var(--text-secondary)' }}>{filtered.length}</strong> dari {roomList.length} ruangan
      </p>

      {editing !== undefined && (
        <RoomEditor
          initial={editing}
          productTypes={ptList}
          onClose={() => setEditing(undefined)}
          onSaved={handleSaved}
        />
      )}

      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg('')} />}
    </>
  );
}

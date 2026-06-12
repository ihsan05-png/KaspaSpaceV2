import { useState, useEffect } from 'react';
import { AdminIcon } from '../AdminIcons';
import { useApiGet } from '../../hooks/useApiGet';
import { adminGet, adminPost, adminPut } from '../../lib/adminApi';

/* ============================================================
   TYPES
   ============================================================ */
interface OperationalHour {
  day:    number;
  label:  string;
  open:   string;
  close:  string;
  active: boolean;
}

interface LocationData {
  label:   string;
  name:    string;
  city:    string;
  address: string;
  img:     string;
  seats:   string;
}

interface AdminSettingsData {
  locations:         LocationData[];
  operational_hours: Record<string, OperationalHour[]>;
  site_name:         string;
  site_address:      string;
  ppn_enabled:       boolean;
  ppn_rate:          number;
}


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
   JAM OPERASIONAL PANEL
   ============================================================ */
function OperationalHoursPanel({ onToast }: { onToast: (msg: string) => void }) {
  const { data, loading, error, refetch } = useApiGet<AdminSettingsData>(() => adminGet('settings'));

  const locationList = data?.locations ?? [];
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [draftHours, setDraftHours] = useState<Record<string, OperationalHour[]>>({});
  const [saving, setSaving] = useState(false);

  const activeLabel = selectedLabel ?? locationList[0]?.label ?? null;

  const getHours = (label: string): OperationalHour[] => {
    const fromDraft = draftHours[label];
    const fromData  = data?.operational_hours?.[label];
    return fromDraft ?? fromData ?? [];
  };

  const update = (label: string, day: number, field: keyof OperationalHour, value: unknown) => {
    const base = getHours(label);
    setDraftHours(prev => ({
      ...prev,
      [label]: base.map(h => h.day === day ? { ...h, [field]: value } : h),
    }));
  };

  const applyAllSame = () => {
    if (!activeLabel) return;
    const base  = getHours(activeLabel);
    const first = base.find(h => h.active);
    if (!first) return;
    setDraftHours(prev => ({
      ...prev,
      [activeLabel]: base.map(h => ({ ...h, open: first.open, close: first.close })),
    }));
  };

  const handleSave = async () => {
    if (!activeLabel) return;
    setSaving(true);
    try {
      await adminPost('settings/operational-hours', {
        location: activeLabel,
        hours: getHours(activeLabel),
      });
      setDraftHours(prev => {
        const next = { ...prev };
        delete next[activeLabel];
        return next;
      });
      refetch();
      onToast(`Jam operasional ${activeLabel} disimpan`);
    } catch {
      onToast('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="panel-sub">Memuat...</p>;
  if (error || !locationList.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p className="panel-sub" style={{ color: 'var(--danger, #e55)' }}>
        {error ?? 'Gagal memuat lokasi. Restart Laragon lalu Coba Lagi.'}
      </p>
      <button type="button" className="btn btn-ghost" onClick={refetch}>Coba Lagi</button>
    </div>
  );

  const currentHours = activeLabel ? getHours(activeLabel) : [];
  const isDirty = activeLabel ? !!draftHours[activeLabel] : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Location tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {locationList.map(loc => (
          <button
            key={loc.label}
            type="button"
            onClick={() => setSelectedLabel(loc.label)}
            style={{
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 20,
              border: '1px solid var(--border)',
              cursor: 'pointer',
              background: loc.label === activeLabel ? 'var(--accent)' : 'transparent',
              color: loc.label === activeLabel ? '#fff' : 'var(--text-secondary)',
              transition: 'all .15s',
            }}
          >
            {loc.name}
            {draftHours[loc.label] ? (
              <span style={{ marginLeft: 5, opacity: .7, fontSize: 10 }}>●</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Header action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <p className="panel-sub" style={{ margin: 0, fontSize: 12 }}>
          Klik nama hari untuk aktif/nonaktif.
        </p>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ fontSize: 12, padding: '5px 10px' }}
          onClick={applyAllSame}
        >
          Samakan semua jam
        </button>
      </div>

      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '120px 1fr 1fr',
        gap: 12,
        padding: '6px 0',
        borderBottom: '2px solid var(--border)',
        marginBottom: 2,
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>HARI</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>BUKA</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600, letterSpacing: '0.05em' }}>TUTUP</span>
      </div>

      {/* Day rows */}
      {activeLabel && currentHours.map(h => (
        <div
          key={h.day}
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 1fr',
            alignItems: 'center',
            gap: 12,
            padding: '7px 0',
            borderBottom: '1px solid var(--border)',
            opacity: h.active ? 1 : 0.4,
          }}
        >
          <button
            type="button"
            aria-label={`${h.label} — ${h.active ? 'Aktif' : 'Nonaktif'}`}
            onClick={() => update(activeLabel, h.day, 'active', !h.active)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: h.active ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            <span className="settings-toggle" style={{ flexShrink: 0 }}>
              <span className={`settings-toggle-thumb${h.active ? ' on' : ''}`} />
            </span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{h.label}</span>
          </button>

          <input
            type="time"
            aria-label={`Jam buka ${h.label}`}
            value={h.open}
            disabled={!h.active}
            onChange={e => update(activeLabel, h.day, 'open', e.target.value)}
            style={{ padding: '6px 10px', fontSize: 13, width: '100%' }}
          />

          <input
            type="time"
            aria-label={`Jam tutup ${h.label}`}
            value={h.close}
            disabled={!h.active}
            onChange={e => update(activeLabel, h.day, 'close', e.target.value)}
            style={{ padding: '6px 10px', fontSize: 13, width: '100%' }}
          />
        </div>
      ))}

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 16 }}
        onClick={handleSave}
        disabled={saving || !isDirty}
      >
        {saving ? 'Menyimpan...' : `Simpan${isDirty ? ' *' : ''} Jam Operasional`}
      </button>
    </div>
  );
}

/* ============================================================
   KELOLA LOKASI PANEL
   ============================================================ */
const BLANK_LOC: LocationData = { label: '', name: '', city: '', address: '', img: '', seats: '' };

function LocationsPanel({ onToast }: { onToast: (msg: string) => void }) {
  const { data, loading, refetch } = useApiGet<AdminSettingsData>(() => adminGet('settings'));
  const [locs, setLocs]   = useState<LocationData[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm]   = useState<LocationData>(BLANK_LOC);
  const [saving, setSaving] = useState(false);

  const current = locs ?? data?.locations ?? [];

  const save = async (next: LocationData[]) => {
    setSaving(true);
    try {
      await adminPut('settings/locations', { locations: next });
      setLocs(null);
      refetch();
      onToast('Lokasi disimpan');
    } catch {
      onToast('Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const remove = (label: string) => {
    const next = current.filter(l => l.label !== label);
    setLocs(next);
    save(next);
  };

  const addLoc = async () => {
    if (!form.label || !form.name || !form.city || !form.address) {
      onToast('Label, nama, kota, dan alamat wajib diisi');
      return;
    }
    if (current.some(l => l.label === form.label)) {
      onToast('Label lokasi sudah ada');
      return;
    }
    const next = [...current, form];
    setLocs(next);
    setForm(BLANK_LOC);
    setAdding(false);
    await save(next);
  };

  if (loading) return <p className="panel-sub">Memuat...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Location list */}
      {current.map(loc => (
        <div
          key={loc.label}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{loc.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{loc.city} · {loc.label}</div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ fontSize: 11, padding: '4px 10px', color: 'var(--danger, #e55)' }}
            onClick={() => remove(loc.label)}
            disabled={saving}
          >
            Hapus
          </button>
        </div>
      ))}

      {/* Add form */}
      {adding ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14 }}>
          <div className="field-row">
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>Label (key unik)</label>
              <input aria-label="Label (key unik)" placeholder="Manahan, Solo" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>Kota</label>
              <input aria-label="Kota" placeholder="Solo" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 11 }}>Nama Cabang</label>
            <input aria-label="Nama Cabang" placeholder="Kaspa Space Manahan" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: 11 }}>Alamat</label>
            <input aria-label="Alamat" placeholder="Jl. ..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          </div>
          <div className="field-row">
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>Kapasitas</label>
              <input aria-label="Kapasitas" placeholder="60+ seat" value={form.seats} onChange={e => setForm(f => ({ ...f, seats: e.target.value }))} />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label style={{ fontSize: 11 }}>URL Foto</label>
              <input aria-label="URL Foto" placeholder="https://..." value={form.img} onChange={e => setForm(f => ({ ...f, img: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={addLoc} disabled={saving}>Tambah Lokasi</button>
            <button type="button" className="btn btn-ghost" onClick={() => { setAdding(false); setForm(BLANK_LOC); }}>Batal</button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 14, justifyContent: 'center' }}
          onClick={() => setAdding(true)}
        >
          + Tambah Cabang
        </button>
      )}
    </div>
  );
}

/* ============================================================
   PAYMENT METHODS PANEL
   ============================================================ */
interface Rekening { bank: string; number: string; holder: string; }
interface PaymentData {
  qris:     { enabled: boolean; image_url: string };
  tunai:    { enabled: boolean };
  rekening: Rekening[];
}
const BLANK_REK: Rekening = { bank: '', number: '', holder: '' };

function PaymentMethodsPanel({ onToast }: { onToast: (msg: string) => void }) {
  const { data, loading } = useApiGet<PaymentData>(() => adminGet('settings/payment-methods'));

  const [pm, setPm] = useState<PaymentData>({
    qris:     { enabled: false, image_url: '' },
    tunai:    { enabled: false },
    rekening: [],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setPm(data); }, [data]);

  if (loading) return <p className="panel-sub">Memuat...</p>;

  const addRek    = () => setPm(p => ({ ...p, rekening: [...p.rekening, { ...BLANK_REK }] }));
  const removeRek = (i: number) => setPm(p => ({ ...p, rekening: p.rekening.filter((_, idx) => idx !== i) }));
  const updateRek = (i: number, field: keyof Rekening, val: string) =>
    setPm(p => ({ ...p, rekening: p.rekening.map((r, idx) => idx === i ? { ...r, [field]: val } : r) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminPut('settings/payment-methods', pm);
      onToast('Metode pembayaran disimpan');
    } catch { onToast('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
    <button type="button" className="settings-toggle" aria-label={label} title={label} onClick={onToggle}>
      <span className={`settings-toggle-thumb${on ? ' on' : ''}`} />
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* QRIS */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>QRIS</div>
            <p className="field-hint">Upload gambar QR code untuk pembayaran</p>
          </div>
          <Toggle on={pm.qris.enabled} label="Aktifkan QRIS"
            onToggle={() => setPm(p => ({ ...p, qris: { ...p.qris, enabled: !p.qris.enabled } }))} />
        </div>
        {pm.qris.enabled && (
          <div className="field">
            <label>URL Gambar QRIS</label>
            <input placeholder="https://..." value={pm.qris.image_url}
              onChange={e => setPm(p => ({ ...p, qris: { ...p.qris, image_url: e.target.value } }))} />
            {pm.qris.image_url && (
              <img src={pm.qris.image_url} alt="Preview QRIS"
                style={{ marginTop: 10, maxWidth: 160, borderRadius: 8, border: '1px solid var(--border)' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
          </div>
        )}
      </div>

      {/* Tunai */}
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Tunai / Cash</div>
          <p className="field-hint">Pembayaran langsung di tempat</p>
        </div>
        <Toggle on={pm.tunai.enabled} label="Aktifkan Tunai"
          onToggle={() => setPm(p => ({ ...p, tunai: { enabled: !p.tunai.enabled } }))} />
      </div>

      {/* Rekening */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Nomor Rekening Transfer</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pm.rekening.map((r, i) => (
            <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="field-row">
                <div className="field">
                  <label>Nama Bank</label>
                  <input placeholder="BCA" value={r.bank} onChange={e => updateRek(i, 'bank', e.target.value)} />
                </div>
                <div className="field">
                  <label>No. Rekening</label>
                  <input placeholder="1234567890" value={r.number} onChange={e => updateRek(i, 'number', e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div className="field" style={{ flex: 1 }}>
                  <label>Atas Nama</label>
                  <input placeholder="Kaspa Space" value={r.holder} onChange={e => updateRek(i, 'holder', e.target.value)} />
                </div>
                <button type="button" className="btn btn-ghost" style={{ color: 'var(--danger,#e55)', flexShrink: 0 }}
                  onClick={() => removeRek(i)}>Hapus</button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={addRek}>
            + Tambah Rekening
          </button>
        </div>
      </div>

      <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan Metode Pembayaran'}
      </button>
    </div>
  );
}

/* ============================================================
   MIDTRANS PANEL
   ============================================================ */
interface MidtransData {
  enabled: boolean;
  server_key: string;
  client_key: string;
  is_production: boolean;
}

function MidtransPanel({ onToast }: { onToast: (msg: string) => void }) {
  const { data, loading } = useApiGet<MidtransData>(() => adminGet('settings/midtrans'));

  const [form, setForm] = useState<MidtransData>({
    enabled: false,
    server_key: '',
    client_key: '',
    is_production: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);

  if (loading) return <p className="panel-sub">Memuat...</p>;

  const Toggle = ({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) => (
    <button type="button" className="settings-toggle" aria-label={label} title={label} onClick={onToggle}>
      <span className={`settings-toggle-thumb${on ? ' on' : ''}`} />
    </button>
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminPut('settings/midtrans', form);
      onToast('Konfigurasi Midtrans disimpan');
    } catch { onToast('Gagal menyimpan'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Enable toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Aktifkan Midtrans</div>
          <p className="field-hint">Tampilkan opsi pembayaran online di checkout</p>
        </div>
        <Toggle on={form.enabled} label="Aktifkan Midtrans"
          onToggle={() => setForm(f => ({ ...f, enabled: !f.enabled }))} />
      </div>

      {/* Environment toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Mode Produksi</div>
          <p className="field-hint">Nonaktif = Sandbox (testing). Aktif = Production (live)</p>
        </div>
        <Toggle on={form.is_production} label="Mode Produksi"
          onToggle={() => setForm(f => ({ ...f, is_production: !f.is_production }))} />
      </div>

      {/* Keys */}
      <div className="field">
        <label>Server Key</label>
        <input
          type="password"
          aria-label="Midtrans Server Key"
          placeholder={form.is_production ? 'Mid-server-...' : 'SB-Mid-server-...'}
          value={form.server_key}
          onChange={e => setForm(f => ({ ...f, server_key: e.target.value }))}
        />
        <p className="field-hint">Digunakan server-side untuk membuat transaksi. Jangan dibagikan.</p>
      </div>

      <div className="field">
        <label>Client Key</label>
        <input
          aria-label="Midtrans Client Key"
          placeholder={form.is_production ? 'Mid-client-...' : 'SB-Mid-client-...'}
          value={form.client_key}
          onChange={e => setForm(f => ({ ...f, client_key: e.target.value }))}
        />
        <p className="field-hint">Digunakan frontend untuk membuka Snap popup.</p>
      </div>

      {form.enabled && !form.server_key && (
        <div style={{ background: 'var(--warning-bg, #fff8e1)', border: '1px solid var(--warning, #f9a825)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--warning-text, #7a5900)' }}>
          Server Key wajib diisi agar transaksi Midtrans bisa diproses.
        </div>
      )}

      <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Menyimpan...' : 'Simpan Konfigurasi Midtrans'}
      </button>
    </div>
  );
}

/* ============================================================
   MAIN
   ============================================================ */
export default function AdminSettings() {
  const { data } = useApiGet<AdminSettingsData>(() => adminGet('settings'));

  const [profile, setProfile] = useState({
    name:  'Admin Kaspa',
    email: 'admin@kaspaspace.id',
    phone: '+62 812 3456 7890',
    role:  'Super Admin',
  });

  const [system, setSystem] = useState({
    siteName:   data?.site_name    ?? 'Kaspa Space',
    address:    data?.site_address ?? 'Manahan, Solo, Jawa Tengah',
    ppnEnabled: data?.ppn_enabled  ?? false,
    ppnRate:    data?.ppn_rate     ?? 11,
  });

  const [notif, setNotif] = useState({
    emailBooking: true,
    emailMember:  true,
    emailReport:  false,
    pushAll:      true,
  });

  const [toastMsg, setToastMsg] = useState('');
  const toast = (msg: string) => setToastMsg(msg);

  const [savingSystem, setSavingSystem] = useState(false);

  const handleSaveSystem = async () => {
    setSavingSystem(true);
    try {
      await adminPost('settings/system', {
        site_name:   system.siteName,
        site_address: system.address,
        ppn_enabled: system.ppnEnabled,
        ppn_rate:    system.ppnRate,
      });
      toast('Konfigurasi disimpan');
    } catch {
      toast('Gagal menyimpan');
    } finally {
      setSavingSystem(false);
    }
  };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Pengaturan <em>Sistem</em></h1>
          <p className="admin-page-sub">Kelola profil admin dan konfigurasi platform</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>

        {/* Kolom kiri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Profil Admin */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Profil <em>Admin</em></h3>
                <p className="panel-sub">Informasi akun administrator</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field-row">
                <div className="field">
                  <label>Nama Lengkap</label>
                  <input aria-label="Nama Lengkap" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="field">
                  <label>Role</label>
                  <input aria-label="Role" value={profile.role} disabled style={{ opacity: .5 }} />
                </div>
              </div>
              <div className="field">
                <label>Email</label>
                <input aria-label="Email" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="field">
                <label>Nomor HP</label>
                <input aria-label="Nomor HP" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="field">
                <label>Password Baru</label>
                <input aria-label="Password Baru" type="password" placeholder="Kosongkan jika tidak ingin mengubah" />
              </div>
              <button type="button" className="btn btn-primary" onClick={() => toast('Profil diperbarui')}>
                Simpan Profil
              </button>
            </div>
          </div>

          {/* Konfigurasi Platform */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Konfigurasi <em>Platform</em></h3>
                <p className="panel-sub">Pengaturan umum sistem</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="field">
                <label>Nama Situs</label>
                <input aria-label="Nama Situs" value={system.siteName} onChange={e => setSystem(s => ({ ...s, siteName: e.target.value }))} />
              </div>
              <div className="field">
                <label>Alamat Utama</label>
                <input aria-label="Alamat Utama" value={system.address} onChange={e => setSystem(s => ({ ...s, address: e.target.value }))} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Mata Uang</label>
                  <select aria-label="Mata Uang" defaultValue="IDR">
                    <option>IDR</option>
                    <option>USD</option>
                    <option>SGD</option>
                  </select>
                </div>
                <div className="field">
                  <label>Zona Waktu</label>
                  <select aria-label="Zona Waktu" defaultValue="WIB (UTC+7)">
                    <option>WIB (UTC+7)</option>
                    <option>WITA (UTC+8)</option>
                    <option>WIT (UTC+9)</option>
                  </select>
                </div>
              </div>

              {/* PPN */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Pajak (PPN)</div>
                    <div className="field-hint" style={{ marginTop: 2 }}>PPN akan ditambahkan ke total harga saat checkout</div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      aria-label="Aktifkan PPN"
                      checked={system.ppnEnabled}
                      onChange={e => setSystem(s => ({ ...s, ppnEnabled: e.target.checked }))}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 13 }}>{system.ppnEnabled ? 'Aktif' : 'Nonaktif'}</span>
                  </label>
                </div>
                {system.ppnEnabled && (
                  <div className="field" style={{ maxWidth: 160 }}>
                    <label>Tarif PPN (%)</label>
                    <input
                      type="number" min="0" max="100" step="1"
                      aria-label="Tarif PPN (%)"
                      value={system.ppnRate}
                      onChange={e => setSystem(s => ({ ...s, ppnRate: Number(e.target.value) }))}
                    />
                  </div>
                )}
              </div>

              <button type="button" className="btn btn-primary" onClick={handleSaveSystem} disabled={savingSystem}>
                {savingSystem ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </button>
            </div>
          </div>

          {/* Metode Pembayaran */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Metode <em>Pembayaran</em></h3>
                <p className="panel-sub">Tampil di halaman checkout booking</p>
              </div>
            </div>
            <PaymentMethodsPanel onToast={toast} />
          </div>

          {/* Midtrans */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Payment Gateway <em>Midtrans</em></h3>
                <p className="panel-sub">Kartu kredit, transfer bank, GoPay, OVO, dll</p>
              </div>
            </div>
            <MidtransPanel onToast={toast} />
          </div>

        </div>

        {/* Kolom kanan */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Kelola Lokasi */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Kelola <em>Lokasi</em></h3>
                <p className="panel-sub">Tambah atau hapus cabang. Otomatis sync ke halaman Tentang.</p>
              </div>
            </div>
            <LocationsPanel onToast={toast} />
          </div>

          {/* Jam Operasional */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Jam <em>Operasional</em></h3>
                <p className="panel-sub">Tampil di halaman FnB, Coworking, dan Hero</p>
              </div>
            </div>
            <OperationalHoursPanel onToast={toast} />
          </div>

          {/* Notifikasi */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Notifikasi <em>Email</em></h3>
                <p className="panel-sub">Atur kapan kamu menerima notifikasi</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {([
                { key: 'emailBooking', label: 'Booking baru',       sub: 'Terima email setiap ada booking masuk' },
                { key: 'emailMember',  label: 'Member baru',         sub: 'Terima email saat ada registrasi member' },
                { key: 'emailReport',  label: 'Laporan mingguan',    sub: 'Ringkasan pendapatan setiap Senin pagi' },
                { key: 'pushAll',      label: 'Push notification',   sub: 'Notifikasi browser untuk semua aktivitas' },
              ] as { key: keyof typeof notif; label: string; sub: string }[]).map(item => (
                <div
                  key={item.key}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{item.sub}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotif(n => ({ ...n, [item.key]: !n[item.key] }))}
                    className="settings-toggle"
                    aria-label={item.label}
                  >
                    <span className={`settings-toggle-thumb${notif[item.key] ? ' on' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ paddingTop: 16 }}>
              <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => toast('Pengaturan notifikasi disimpan')}>
                Simpan Notifikasi
              </button>
            </div>
          </div>

        </div>
      </div>

      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg('')} />}
    </>
  );
}

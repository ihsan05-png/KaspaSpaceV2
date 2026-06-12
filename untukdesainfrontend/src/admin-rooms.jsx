/* global React, Icon, ROOM_TYPES, ROOM_TYPE_CLASS, LOCATIONS */
const { useState: useRoomState, useMemo: useRoomMemo } = React;

/* ============================================
   ADMIN ICON EXTENSIONS
   ============================================ */
const AdminIcon = {
  Dashboard: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>,
  Door: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M2 21h18"/><path d="M16 8h5a1 1 0 0 1 1 1v12"/><circle cx="13" cy="13" r="0.8" fill="currentColor"/></svg>,
  Ticket: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M9 6v12"/></svg>,
  Users: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Map: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Chart: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-6"/></svg>,
  Cog: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Bell: (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  LogOut: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Edit: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
  Trash: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Eye: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Check: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  X: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Upload: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  TrendUp: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  TrendDown: (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
};

/* ============================================
   ROOM EDITOR MODAL
   ============================================ */
function RoomEditor({ initial, onClose, onSave, onDelete }) {
  const isEdit = !!initial;
  const blank = {
    title: "",
    type: "Share Desk",
    loc: LOCATIONS[0],
    price: ROOM_TYPES[0].suggestedPrice,
    unit: ROOM_TYPES[0].unit,
    capacity: ROOM_TYPES[0].capacity,
    amenity: ROOM_TYPES[0].amenity,
    img: ROOM_TYPES[0].img,
    badge: "",
    status: "active",
    rating: 0,
    reviews: 0,
  };
  const [form, setForm] = useRoomState(initial || blank);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const onPickType = (t) => {
    setForm(f => ({
      ...f,
      type: t.key,
      // only auto-fill these if user hasn't customized them
      unit: f.unit && initial ? f.unit : t.unit,
      img:  f.img && initial ? f.img : t.img,
      capacity: f.capacity && initial ? f.capacity : t.capacity,
      amenity:  f.amenity && initial ? f.amenity : t.amenity,
      price: (f.price && initial) ? f.price : t.suggestedPrice,
      title: (f.title && initial) ? f.title : t.key,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({
      ...form,
      id: initial ? initial.id : Date.now(),
      price: Number(form.price) || 0,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={e => e.stopPropagation()} onSubmit={handleSave}>
        <div className="modal-head">
          <div>
            <h3>{isEdit ? <>Edit <em>Ruangan</em></> : <>Tambah <em>Ruangan</em></>}</h3>
            <p className="panel-sub">Ruangan otomatis muncul di halaman Coworking Space publik.</p>
          </div>
          <button type="button" className="close" onClick={onClose} aria-label="Tutup">
            <AdminIcon.X />
          </button>
        </div>

        <div className="modal-body">
          {/* TYPE PICKER */}
          <div className="field">
            <label>Tipe Ruangan</label>
            <div className="type-picker">
              {ROOM_TYPES.map(t => (
                <button
                  type="button"
                  key={t.key}
                  className={`type-card ${form.type === t.key ? "selected" : ""}`}
                  onClick={() => onPickType(t)}
                >
                  <span className="type-check"><AdminIcon.Check /></span>
                  <span className="type-icon">
                    {t.key === "Share Desk" && <Icon.Briefcase />}
                    {t.key === "Private Room" && <Icon.Building />}
                    {t.key === "Meeting Room" && <Icon.Users />}
                    {t.key === "Private Office" && <Icon.Building />}
                    {t.key === "Virtual Office" && <Icon.Tag />}
                    {t.key === "Business Signage" && <Icon.Award />}
                    {t.key === "Overtime" && <Icon.Zap />}
                  </span>
                  <span className="type-name">{t.key}</span>
                  <span className="type-desc">{t.desc}</span>
                </button>
              ))}
            </div>
            <div className="field-hint">
              Pilih tipe → harga, kapasitas & gambar default akan menyesuaikan. Tetap bisa diubah manual di bawah.
            </div>
          </div>

          {/* NAME + LOCATION */}
          <div className="field-row">
            <div className="field">
              <label>Nama Ruangan</label>
              <input
                value={form.title}
                onChange={e => set("title", e.target.value)}
                placeholder="cth. Share Desk Lt. 3"
                required
              />
            </div>
            <div className="field">
              <label>Lokasi</label>
              <select value={form.loc} onChange={e => set("loc", e.target.value)}>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* PRICE / UNIT / CAPACITY */}
          <div className="field-row r3">
            <div className="field">
              <label>Harga</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.price}
                onChange={e => set("price", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Satuan</label>
              <select value={form.unit} onChange={e => set("unit", e.target.value)}>
                {["jam", "hari", "minggu", "bulan", "tahun"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Kapasitas</label>
              <input
                value={form.capacity}
                onChange={e => set("capacity", e.target.value)}
                placeholder="1 org / 4-8 org"
              />
            </div>
          </div>

          {/* AMENITY + STATUS + BADGE */}
          <div className="field-row r3">
            <div className="field">
              <label>Amenity Utama</label>
              <input
                value={form.amenity}
                onChange={e => set("amenity", e.target.value)}
                placeholder="Projector, Wifi 1Gbps..."
              />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}>
                <option value="active">Aktif</option>
                <option value="draft">Draft</option>
                <option value="archived">Diarsip</option>
              </select>
            </div>
            <div className="field">
              <label>Badge (opsional)</label>
              <input
                value={form.badge}
                onChange={e => set("badge", e.target.value)}
                placeholder="cth. Best Seller"
              />
            </div>
          </div>

          {/* IMAGE */}
          <div className="field">
            <label>URL Gambar</label>
            <input
              value={form.img}
              onChange={e => set("img", e.target.value)}
              placeholder="https://..."
            />
            <div className="field-hint">Default mengikuti tipe — boleh tempel URL custom dari Unsplash / storage Anda.</div>
          </div>
        </div>

        <div className="modal-foot">
          <div>
            {isEdit && (
              <button
                type="button"
                className="icon-btn danger"
                style={{ width: "auto", padding: "0 14px", height: 38, gap: 8, display: "inline-flex", alignItems: "center" }}
                onClick={() => onDelete(initial)}
              >
                <AdminIcon.Trash /> Hapus
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary">
              {isEdit ? "Simpan Perubahan" : "Tambah Ruangan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ============================================
   ROOM TABLE
   ============================================ */
function RoomTable({ rooms, onEdit }) {
  if (!rooms.length) {
    return (
      <div className="empty">
        <h4>Belum ada ruangan</h4>
        <p>Filter aktif tidak menemukan ruangan. Coba reset atau tambah ruangan baru.</p>
      </div>
    );
  }
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ruangan</th>
            <th>Tipe</th>
            <th>Lokasi</th>
            <th>Harga</th>
            <th>Kapasitas</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map(r => (
            <tr key={r.id}>
              <td className="col-title">
                <div className="cell-media">
                  <img className="cell-media-img" src={r.img} alt={r.title} loading="lazy" />
                  <div className="cell-media-meta">
                    <span className="t">{r.title}</span>
                    <span className="s">
                      #{r.id}
                      {r.badge && <> <span className="dot-divider">·</span> {r.badge}</>}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <span className={`tag ${ROOM_TYPE_CLASS[r.type] || ""}`}>{r.type}</span>
              </td>
              <td>{r.loc}</td>
              <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-primary)", fontWeight: 600 }}>
                Rp{Number(r.price).toLocaleString("id-ID")}
                <span style={{ color: "var(--text-tertiary)", fontWeight: 400, fontSize: 12 }}> / {r.unit}</span>
              </td>
              <td>{r.capacity}</td>
              <td><span className={`status ${r.status || "active"}`}>{(r.status || "active").charAt(0).toUpperCase() + (r.status || "active").slice(1)}</span></td>
              <td className="col-actions">
                <button className="icon-btn" onClick={() => onEdit(r)} title="Edit"><AdminIcon.Edit /></button>
                <a className="icon-btn" href={`Coworking Space.html#rooms`} target="_blank" rel="noreferrer" title="Lihat di publik"><AdminIcon.Eye /></a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================
   ROOMS PAGE
   ============================================ */
function RoomsPage({ rooms, setRooms, openEditor, editing, setEditing, toast }) {
  const [search, setSearch] = useRoomState("");
  const [typeFilter, setTypeFilter] = useRoomState("Semua");
  const [locFilter, setLocFilter] = useRoomState("Semua");
  const [statusFilter, setStatusFilter] = useRoomState("Semua");

  const filtered = useRoomMemo(() => {
    return rooms.filter(r => {
      if (typeFilter !== "Semua" && r.type !== typeFilter) return false;
      if (locFilter !== "Semua" && r.loc !== locFilter) return false;
      if (statusFilter !== "Semua" && (r.status || "active") !== statusFilter) return false;
      if (search && !`${r.title} ${r.loc} ${r.type}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rooms, search, typeFilter, locFilter, statusFilter]);

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Ruangan</em></h1>
          <p className="admin-page-sub">
            {rooms.length} ruangan terdaftar
            <span className="dot-divider"> · </span>
            <a className="live-link" href="#/coworking" target="_blank" rel="noreferrer">Live di publik</a>
          </p>
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-ghost" onClick={() => {
            if (confirm("Reset semua ruangan ke data default? Perubahan akan hilang.")) {
              localStorage.removeItem(window.KASPA_ROOMS_KEY);
              setRooms(window.DEFAULT_ROOMS);
              toast("Data ruangan direset");
            }
          }}>Reset Default</button>
          <button className="btn btn-primary" onClick={() => openEditor(null)}>
            <Icon.Plus /> Tambah Ruangan
          </button>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-wrap">
          <Icon.Search />
          <input className="search" placeholder="Cari nama, lokasi, atau tipe..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option>Semua</option>
          {ROOM_TYPES.map(t => <option key={t.key}>{t.key}</option>)}
        </select>
        <select value={locFilter} onChange={e => setLocFilter(e.target.value)}>
          <option>Semua</option>
          {LOCATIONS.map(l => <option key={l}>{l}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>Semua</option>
          <option value="active">Aktif</option>
          <option value="draft">Draft</option>
          <option value="archived">Diarsip</option>
        </select>
      </div>

      <RoomTable rooms={filtered} onEdit={openEditor} />

      <p className="panel-sub" style={{ marginTop: -6 }}>
        Menampilkan <strong style={{ color: "var(--text-secondary)" }}>{filtered.length}</strong> dari {rooms.length} ruangan
      </p>
    </>
  );
}

window.AdminIcon = AdminIcon;
window.RoomEditor = RoomEditor;
window.RoomsPage = RoomsPage;

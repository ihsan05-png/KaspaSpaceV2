/* global React, ReactDOM, Icon, AdminIcon, RoomsPage, RoomEditor,
   ROOM_TYPES, ROOM_TYPE_CLASS, LOCATIONS,
   loadRooms, saveRooms, makeBookings */
const { useState: useAdmin, useEffect: useAdminEffect, useMemo: useAdminMemo } = React;

/* ============================================
   ADMIN APP
   ============================================ */
function AdminApp() {
  const [page, setPage] = useAdmin("dashboard");
  const [rooms, setRooms] = useAdmin(() => loadRooms());
  const [editing, setEditing] = useAdmin(null);   // room being edited
  const [editorOpen, setEditorOpen] = useAdmin(false);
  const [toastMsg, setToastMsg] = useAdmin(null);

  // Persist rooms whenever they change
  useAdminEffect(() => { saveRooms(rooms); }, [rooms]);

  // Auto-hide toast
  useAdminEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2600);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const toast = (msg, sub) => setToastMsg({ msg, sub });

  const openEditor = (room) => { setEditing(room); setEditorOpen(true); };
  const closeEditor = () => { setEditorOpen(false); setEditing(null); };

  const handleSave = (room) => {
    setRooms(prev => {
      const exists = prev.find(p => p.id === room.id);
      if (exists) {
        toast("Ruangan diperbarui", room.title);
        return prev.map(p => p.id === room.id ? { ...p, ...room } : p);
      }
      toast("Ruangan ditambahkan", room.title);
      return [...prev, room];
    });
    closeEditor();
  };

  const handleDelete = (room) => {
    if (!confirm(`Hapus ruangan "${room.title}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    setRooms(prev => prev.filter(p => p.id !== room.id));
    toast("Ruangan dihapus", room.title);
    closeEditor();
  };

  const bookings = useAdminMemo(() => makeBookings(rooms), [rooms]);

  const nav = [
    { key: "dashboard", label: "Dashboard", icon: <AdminIcon.Dashboard /> },
    { key: "rooms",     label: "Ruangan",   icon: <AdminIcon.Door />, count: rooms.length },
    { key: "bookings",  label: "Booking",   icon: <AdminIcon.Ticket />, count: bookings.length },
    { key: "members",   label: "Member",    icon: <AdminIcon.Users /> },
    { key: "locations", label: "Lokasi",    icon: <AdminIcon.Map /> },
    { key: "reports",   label: "Laporan",   icon: <AdminIcon.Chart /> },
  ];

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className="admin-side" data-screen-label="Admin sidebar">
        <a className="admin-logo" href="#/home">
          <span className="admin-logo-mark">Kaspa</span>
          <span className="admin-logo-tag">Space</span>
          <span className="admin-logo-badge">Admin</span>
        </a>

        <nav className="admin-nav">
          <div className="admin-nav-section">Workspace</div>
          {nav.slice(0, 4).map(n => (
            <button key={n.key} className={`admin-nav-item ${page === n.key ? "active" : ""}`} onClick={() => setPage(n.key)}>
              <span className="admin-nav-icon">{n.icon}</span>
              <span>{n.label}</span>
              {n.count != null && <span className="admin-nav-count">{n.count}</span>}
            </button>
          ))}
          <div className="admin-nav-section">Lainnya</div>
          {nav.slice(4).map(n => (
            <button key={n.key} className={`admin-nav-item ${page === n.key ? "active" : ""}`} onClick={() => setPage(n.key)}>
              <span className="admin-nav-icon">{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
          <button className="admin-nav-item" onClick={() => setPage("settings")}>
            <span className="admin-nav-icon"><AdminIcon.Cog /></span>
            <span>Pengaturan</span>
          </button>
        </nav>

        <div className="admin-side-foot">
          <div className="admin-avatar">KV</div>
          <div>
            <p className="admin-name">Kevin V.</p>
            <p className="admin-role">Super Admin</p>
          </div>
          <a href="#/auth" title="Logout"><button><AdminIcon.LogOut /></button></a>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main" data-screen-label={`Admin · ${page}`}>
        <div className="admin-topbar">
          <div className="admin-topbar-search">
            <Icon.Search />
            <input placeholder="Cari booking, member, ruangan..." />
          </div>
          <button className="admin-topbar-btn" title="Notifikasi"><AdminIcon.Bell /><span className="dot" /></button>
          <a className="live-link" href="#/coworking" target="_blank" rel="noreferrer">Lihat halaman publik</a>
        </div>

        {page === "dashboard" && <DashboardPage rooms={rooms} bookings={bookings} setPage={setPage} openEditor={openEditor} />}
        {page === "rooms" && <RoomsPage rooms={rooms} setRooms={setRooms} openEditor={openEditor} editing={editing} setEditing={setEditing} toast={toast} />}
        {page === "bookings" && <BookingsPage bookings={bookings} />}
        {page === "members" && <MembersPage />}
        {page === "locations" && <LocationsPage rooms={rooms} />}
        {page === "reports" && <ReportsPage rooms={rooms} />}
        {page === "settings" && <SettingsPage />}
      </main>

      {editorOpen && (
        <RoomEditor
          initial={editing}
          onClose={closeEditor}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {toastMsg && (
        <div className="toast">
          <div className="toast-icon"><AdminIcon.Check /></div>
          <div>
            <div className="t">{toastMsg.msg}</div>
            {toastMsg.sub && <div className="s">{toastMsg.sub}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================
   DASHBOARD PAGE
   ============================================ */
function DashboardPage({ rooms, bookings, setPage, openEditor }) {
  const stats = useAdminMemo(() => {
    const byType = {};
    rooms.forEach(r => { byType[r.type] = (byType[r.type] || 0) + 1; });
    const totalRevenue = bookings.filter(b => b.status === "paid").reduce((a, b) => a + b.total, 0);
    return {
      totalRooms: rooms.length,
      activeRooms: rooms.filter(r => (r.status || "active") === "active").length,
      totalBookings: bookings.length,
      totalRevenue,
      byType,
    };
  }, [rooms, bookings]);

  // Stable pseudo-random chart data
  const chartData = [
    { day: "Sen", revenue: 62, bookings: 48 },
    { day: "Sel", revenue: 78, bookings: 60 },
    { day: "Rab", revenue: 54, bookings: 42 },
    { day: "Kam", revenue: 88, bookings: 72 },
    { day: "Jum", revenue: 95, bookings: 85 },
    { day: "Sab", revenue: 72, bookings: 64 },
    { day: "Min", revenue: 48, bookings: 36 },
  ];

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Selamat pagi, <em>Kevin</em></h1>
          <p className="admin-page-sub">Berikut ringkasan operasional Kaspa Space hari ini · {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-ghost" onClick={() => setPage("reports")}>Lihat Laporan</button>
          <button className="btn btn-primary" onClick={() => openEditor(null)}>
            <Icon.Plus /> Tambah Ruangan
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="kpi-grid">
        <KpiCard
          label="Total Ruangan"
          value={stats.totalRooms}
          icon={<AdminIcon.Door />}
          delta="+2"
          deltaSub="minggu ini"
          up
        />
        <KpiCard
          label="Booking Aktif"
          value={stats.totalBookings}
          icon={<AdminIcon.Ticket />}
          delta="+18%"
          deltaSub="vs minggu lalu"
          up
        />
        <KpiCard
          label="Member Aktif"
          value={342}
          icon={<AdminIcon.Users />}
          delta="+12"
          deltaSub="bulan ini"
          up
        />
        <KpiCard
          label="Pendapatan"
          value={`Rp ${(stats.totalRevenue / 1000000).toFixed(1)}`}
          valueSuffix="jt"
          icon={<Icon.Award />}
          delta="-3%"
          deltaSub="vs minggu lalu"
        />
      </div>

      {/* Chart + donut */}
      <div className="admin-grid-2">
        <RevenueChart data={chartData} />
        <TypeDonut byType={stats.byType} total={stats.totalRooms} />
      </div>

      {/* Recent bookings + occupancy */}
      <div className="admin-grid-3">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Booking <em>Terbaru</em></h3>
              <p className="panel-sub">5 transaksi terakhir</p>
            </div>
            <button className="btn btn-ghost btn-small" onClick={() => setPage("bookings")}>Lihat Semua</button>
          </div>
          <RecentBookings bookings={bookings.slice(0, 5)} />
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h3 className="panel-title">Okupansi <em>Hari Ini</em></h3>
              <p className="panel-sub">Top 5 ruangan</p>
            </div>
          </div>
          <OccupancyList rooms={rooms} />
        </div>
      </div>
    </>
  );
}

function KpiCard({ label, value, valueSuffix, icon, delta, deltaSub, up }) {
  return (
    <div className="kpi-card">
      <div className="kpi-head">
        <span className="kpi-label">{label}</span>
        <span className="kpi-icon">{icon}</span>
      </div>
      <div className="kpi-value">
        {value}
        {valueSuffix && <small>{valueSuffix}</small>}
      </div>
      {delta && (
        <div className={`kpi-delta ${up ? "up" : "down"}`}>
          {up ? <AdminIcon.TrendUp /> : <AdminIcon.TrendDown />}
          {delta} <span className="kpi-delta-sub">{deltaSub}</span>
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }) {
  const [view, setView] = useAdmin("revenue");
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Aktivitas <em>7 hari</em></h3>
          <p className="panel-sub">Pendapatan & booking harian</p>
        </div>
        <div className="panel-tab-bar">
          <button className={`panel-tab ${view === "revenue" ? "active" : ""}`} onClick={() => setView("revenue")}>Pendapatan</button>
          <button className={`panel-tab ${view === "bookings" ? "active" : ""}`} onClick={() => setView("bookings")}>Booking</button>
        </div>
      </div>
      <div className="chart">
        {data.map((d, i) => {
          const v = view === "revenue" ? d.revenue : d.bookings;
          const isToday = i === 4;
          return (
            <div className="chart-col" key={d.day}>
              <div className="chart-bars">
                <div className={`chart-bar ${isToday ? "" : "soft"}`} style={{ height: `${v}%` }} />
              </div>
              <span className="chart-label">{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TypeDonut({ byType, total }) {
  const palette = {
    "Share Desk": "#60a5fa",
    "Private Room": "#a78bfa",
    "Meeting Room": "#f472b6",
    "Private Office": "#fbbf24",
    "Virtual Office": "#34d399",
    "Business Signage": "#7ca8e6",
    "Overtime": "#94a3b8",
  };
  const items = Object.entries(byType).map(([k, v]) => ({
    key: k,
    val: v,
    color: palette[k] || "#7ca8e6",
  })).sort((a, b) => b.val - a.val);

  const R = 60, C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h3 className="panel-title">Bauran <em>Ruangan</em></h3>
          <p className="panel-sub">Distribusi per tipe</p>
        </div>
      </div>
      <div className="donut-wrap">
        <div className="donut">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="18" />
            {items.map(it => {
              const len = (it.val / total) * C;
              const dash = `${len} ${C - len}`;
              const el = (
                <circle key={it.key} cx="80" cy="80" r={R} fill="none"
                  stroke={it.color} strokeWidth="18"
                  strokeDasharray={dash} strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="donut-center">
            <div>
              <div className="num">{total}</div>
              <div className="lbl">Ruangan</div>
            </div>
          </div>
        </div>
        <div className="donut-legend">
          {items.map(it => (
            <div className="legend-row" key={it.key}>
              <span className="dot" style={{ background: it.color }} />
              <span>{it.key}</span>
              <span className="val">{it.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecentBookings({ bookings }) {
  if (!bookings.length) return <div className="empty"><p>Belum ada booking.</p></div>;
  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Ruangan</th>
            <th>Member</th>
            <th>Jadwal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td className="col-title" style={{ fontFamily: "var(--font-mono)" }}>{b.code}</td>
              <td>
                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{b.room.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{b.room.loc}</div>
              </td>
              <td>{b.member}</td>
              <td>
                <div>{b.date}</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{b.slot}</div>
              </td>
              <td>
                <span className={`status ${b.status === "paid" ? "active" : b.status === "pending" ? "draft" : "archived"}`}>
                  {b.status === "paid" ? "Lunas" : b.status === "pending" ? "Menunggu" : b.status === "checked-in" ? "Hadir" : "Batal"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OccupancyList({ rooms }) {
  // Deterministic occupancy based on id
  const items = rooms.slice(0, 5).map((r, i) => ({
    r,
    pct: 30 + ((r.id * 17) % 65),
    sub: `${(r.id * 3) % 8 + 1} dari ${(r.id * 5) % 10 + 4} slot terpakai`,
  })).sort((a, b) => b.pct - a.pct);

  return (
    <div>
      {items.map(it => (
        <div className="mini-room" key={it.r.id}>
          <div>
            <div className="mini-room-name">{it.r.title}</div>
            <div className="mini-room-sub">{it.sub}</div>
            <div className="mini-room-bar"><div className="mini-room-fill" style={{ width: `${it.pct}%` }} /></div>
          </div>
          <div className="mini-room-pct">{it.pct}%</div>
        </div>
      ))}
    </div>
  );
}

/* ============================================
   OTHER PAGES (compact)
   ============================================ */
function BookingsPage({ bookings }) {
  const [filter, setFilter] = useAdmin("all");
  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Manajemen <em>Booking</em></h1>
          <p className="admin-page-sub">{bookings.length} total booking · {bookings.filter(b => b.status === "paid").length} lunas</p>
        </div>
      </div>
      <div className="admin-toolbar">
        <div className="search-wrap"><Icon.Search /><input className="search" placeholder="Cari kode, member, atau ruangan..." /></div>
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Semua Status</option>
          <option value="paid">Lunas</option>
          <option value="pending">Menunggu</option>
          <option value="checked-in">Hadir</option>
          <option value="cancelled">Dibatalkan</option>
        </select>
      </div>
      <RecentBookings bookings={filtered} />
    </>
  );
}

function MembersPage() {
  const members = [
    { name: "Kevin Virdianto", email: "kevin@kaspa.id", plan: "Private Office", since: "Jan 2024", bookings: 142 },
    { name: "Sari Wulandari",  email: "sari.w@gmail.com", plan: "Share Desk", since: "Mar 2024", bookings: 68 },
    { name: "Ahmad Faisal",    email: "ahmad.f@studio.co", plan: "Private Room", since: "Mei 2024", bookings: 32 },
    { name: "Rina Pertiwi",    email: "rina@startup.id", plan: "Virtual Office", since: "Feb 2024", bookings: 14 },
    { name: "Bagas Pratama",   email: "bagas@dev.id", plan: "Share Desk", since: "Jul 2024", bookings: 48 },
    { name: "Linda Hartanto",  email: "linda.h@konsul.co", plan: "Private Office", since: "Nov 2023", bookings: 96 },
  ];
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Member <em>Kaspa</em></h1>
          <p className="admin-page-sub">{members.length} member aktif</p>
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-primary"><Icon.Plus /> Tambah Member</button>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nama</th><th>Email</th><th>Paket</th><th>Member Sejak</th><th>Total Booking</th><th></th></tr></thead>
          <tbody>
            {members.map(m => (
              <tr key={m.email}>
                <td className="col-title">
                  <div className="cell-media">
                    <div className="admin-avatar" style={{ width: 40, height: 40, fontSize: 13, borderRadius: 10 }}>{m.name.split(" ").map(p => p[0]).slice(0,2).join("")}</div>
                    <div className="cell-media-meta"><span className="t">{m.name}</span></div>
                  </div>
                </td>
                <td>{m.email}</td>
                <td><span className={`tag ${ROOM_TYPE_CLASS[m.plan]}`}>{m.plan}</span></td>
                <td>{m.since}</td>
                <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{m.bookings}</td>
                <td className="col-actions"><button className="icon-btn"><AdminIcon.Edit /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function LocationsPage({ rooms }) {
  const grouped = LOCATIONS.map(loc => ({
    loc,
    rooms: rooms.filter(r => r.loc === loc),
  }));
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Lokasi <em>Kaspa</em></h1>
          <p className="admin-page-sub">{LOCATIONS.length} lokasi aktif · {rooms.length} ruangan total</p>
        </div>
      </div>
      <div className="kpi-grid">
        {grouped.map(g => (
          <div className="panel" key={g.loc} style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, color: "var(--text-primary)", fontWeight: 500 }}>{g.loc.split(",")[0]}</div>
                <div style={{ color: "var(--text-tertiary)", fontSize: 12.5 }}>{g.loc.split(",")[1]?.trim()}</div>
              </div>
              <span className="tag share-desk">{g.rooms.length} ruangan</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
              {Object.entries(g.rooms.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + 1; return acc; }, {})).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderTop: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{k}</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ReportsPage({ rooms }) {
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Laporan <em>& Insight</em></h1>
          <p className="admin-page-sub">Performa bisnis Mei 2026</p>
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-ghost"><AdminIcon.Upload /> Ekspor PDF</button>
        </div>
      </div>
      <div className="kpi-grid">
        <KpiCard label="Pendapatan Bulan Ini" value="Rp 84" valueSuffix="jt" icon={<Icon.Award />} delta="+22%" deltaSub="vs Apr" up />
        <KpiCard label="Tingkat Okupansi" value="72%" icon={<AdminIcon.Chart />} delta="+5pt" deltaSub="vs Apr" up />
        <KpiCard label="Rata-rata Booking" value={4.2} icon={<AdminIcon.Ticket />} delta="+0.6" deltaSub="per member" up />
        <KpiCard label="Member Baru" value={28} icon={<AdminIcon.Users />} delta="+12" deltaSub="vs Apr" up />
      </div>
      <div className="panel">
        <div className="panel-head">
          <div>
            <h3 className="panel-title">Ruangan <em>Terlaris</em></h3>
            <p className="panel-sub">Berdasarkan jumlah booking 30 hari terakhir</p>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Peringkat</th><th>Ruangan</th><th>Tipe</th><th>Booking</th><th>Pendapatan</th></tr></thead>
            <tbody>
              {rooms.slice(0, 6).map((r, i) => (
                <tr key={r.id}>
                  <td style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--brand-glow)" }}>#{i + 1}</td>
                  <td className="col-title">{r.title}</td>
                  <td><span className={`tag ${ROOM_TYPE_CLASS[r.type]}`}>{r.type}</span></td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{120 - i * 14}</td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>Rp {((120 - i * 14) * r.price / 1000000).toFixed(1)} jt</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SettingsPage() {
  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Pengaturan</h1>
          <p className="admin-page-sub">Konfigurasi bisnis & integrasi</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><h3 className="panel-title">Informasi <em>Bisnis</em></h3></div>
        <div className="field-row">
          <div className="field"><label>Nama Bisnis</label><input defaultValue="Kaspa Space" /></div>
          <div className="field"><label>Email Kontak</label><input defaultValue="hello@kaspa.space" /></div>
        </div>
        <div className="field-row" style={{ marginTop: 14 }}>
          <div className="field"><label>Nomor WhatsApp</label><input defaultValue="+62 812-3456-7890" /></div>
          <div className="field"><label>Zona Waktu</label><select><option>Asia/Jakarta (WIB)</option></select></div>
        </div>
      </div>
    </>
  );
}

/* ============================================
   MOUNT
   ============================================ */
(window.KaspaPages = window.KaspaPages || {})["admin"] = AdminApp;

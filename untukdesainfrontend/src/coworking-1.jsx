/* global React, Icon, RoomDetailModal */
const { useState: useStateCW, useMemo } = React;

/* ============================================
   ADDITIONAL ICONS
   ============================================ */
const CWIcon = {
  Heart: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Filter: (p) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Check: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  X: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Tilde: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="6" y1="12" x2="18" y2="12"/></svg>,
};

/* ============================================
   SUB-HERO
   ============================================ */
function CWSubHero() {
  return (
    <section className="subhero">
      <div className="subhero-bg">
        <img
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2000&q=80"
          alt="Coworking space"
        />
      </div>
      <div className="container subhero-inner">
        <div className="breadcrumb">
          <a href="#/home">Beranda</a>
          <span className="sep">/</span>
          <a href="#">Produk</a>
          <span className="sep">/</span>
          <span className="current">Coworking Space</span>
        </div>
        <span className="chip chip-dot chip-uppercase">15+ Ruangan tersedia di 6 lokasi</span>
        <h1 className="subhero-title">
          Coworking <em>Space</em>
        </h1>
        <p className="subhero-lede">
          Booking online lebih mudah. Sewa kantor per jam, harian, bulanan, atau tahunan —
          sesuaikan dengan kebutuhan tim dan ritme kerja Anda.
        </p>
        <div className="hero-cta" style={{ justifyContent: "center" }}>
          <a className="btn btn-primary" href="#rooms">Lihat Ruangan <Icon.Arrow /></a>
          <a className="btn btn-ghost" href="#schedule">Cek Jadwal</a>
        </div>
        <div className="subhero-stats">
          <div className="subhero-stat">
            <div className="subhero-stat-num">15<em>+</em></div>
            <div className="subhero-stat-label">Ruangan</div>
          </div>
          <div className="subhero-stat-divider"></div>
          <div className="subhero-stat">
            <div className="subhero-stat-num">6<em>kota</em></div>
            <div className="subhero-stat-label">Lokasi</div>
          </div>
          <div className="subhero-stat-divider"></div>
          <div className="subhero-stat">
            <div className="subhero-stat-num">4.9<em>★</em></div>
            <div className="subhero-stat-label">Rating</div>
          </div>
          <div className="subhero-stat-divider"></div>
          <div className="subhero-stat">
            <div className="subhero-stat-num">500<em>+</em></div>
            <div className="subhero-stat-label">Member</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FILTER + ROOM GRID
   ============================================ */
const CW_DEFAULT_ROOMS = [
  { id: 1, type: "Private Office", title: "Private Office", loc: "Manahan, Solo", rating: 5.0, reviews: 4, price: 100000, unit: "hari", img: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=900&q=80", badge: "Best Seller", capacity: "4-8 org", amenity: "Wifi 1Gbps" },
  { id: 2, type: "Virtual Office", title: "Virtual Office", loc: "Manahan, Solo", rating: 5.0, reviews: 3, price: 200000, unit: "bulan", img: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=900&q=80", capacity: "Legal", amenity: "PKP" },
  { id: 3, type: "Share Desk", title: "Share Desk", loc: "Manahan, Solo", rating: 4.9, reviews: 40, price: 25000, unit: "hari", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80", badge: "Populer", featured: true, capacity: "1 org", amenity: "Kopi gratis" },
  { id: 4, type: "Meeting Room", title: "Meeting Room", loc: "Manahan, Solo", rating: 4.8, reviews: 7, price: 80000, unit: "jam", img: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80", capacity: "6-12 org", amenity: "Projector" },
  { id: 5, type: "Private Room", title: "Private Room Focus", loc: "Manahan, Solo", rating: 4.9, reviews: 11, price: 60000, unit: "jam", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80", badge: "Baru", capacity: "2-4 org", amenity: "Quiet zone" },
  { id: 6, type: "Overtime", title: "Overtime Access", loc: "Manahan, Solo", rating: 4.7, reviews: 12, price: 40000, unit: "hari", img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80", capacity: "24/7", amenity: "Akses 24 jam" },
  { id: 7, type: "Share Desk", title: "Share Desk", loc: "Citraland, Surabaya", rating: 4.8, reviews: 28, price: 100000, unit: "hari", img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80", capacity: "1 org", amenity: "Wifi 1Gbps" },
  { id: 8, type: "Private Room", title: "Private Room Surabaya", loc: "Sinarmas, Surabaya", rating: 4.9, reviews: 9, price: 90000, unit: "jam", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80", capacity: "2-4 org", amenity: "View kota" },
  { id: 9, type: "Share Desk", title: "Share Desk", loc: "Pakuwon, Surabaya", rating: 4.8, reviews: 15, price: 100000, unit: "hari", img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80", capacity: "1 org", amenity: "Kopi gratis" },
  { id: 10, type: "Meeting Room", title: "Meeting Room", loc: "Citraland, Surabaya", rating: 4.7, reviews: 9, price: 100000, unit: "jam", img: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=900&q=80", capacity: "4-10 org", amenity: "TV 55″" },
  { id: 11, type: "Meeting Room", title: "Meeting Room", loc: "Sinarmas, Surabaya", rating: 4.8, reviews: 11, price: 150000, unit: "jam", img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80", capacity: "8-16 org", amenity: "Conference" },
  { id: 12, type: "Private Office", title: "Private Office Corner", loc: "Pakuwon, Surabaya", rating: 4.6, reviews: 8, price: 250000, unit: "hari", img: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=900&q=80", capacity: "4-8 org", amenity: "Whiteboard" },
  { id: 13, type: "Virtual Office", title: "Virtual Office", loc: "Citraland, Surabaya", rating: 4.9, reviews: 22, price: 780000, unit: "tahun", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=900&q=80", capacity: "Legal", amenity: "Resepsionis" },
  { id: 14, type: "Virtual Office", title: "Virtual Office", loc: "Sinarmas, Surabaya", rating: 4.8, reviews: 18, price: 780000, unit: "tahun", img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80", capacity: "Legal", amenity: "PKP" },
  { id: 15, type: "Business Signage", title: "Business Signage", loc: "Pakuwon, Surabaya", rating: 4.7, reviews: 14, price: 620000, unit: "tahun", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80", capacity: "Branding", amenity: "Display" },
];

/* Storage key shared with Admin Dashboard */
const CW_ROOMS_KEY = "kaspa_rooms_v1";

function cwLoadRooms() {
  try {
    const raw = localStorage.getItem(CW_ROOMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch (e) { /* ignore */ }
  return CW_DEFAULT_ROOMS;
}

const ROOMS = cwLoadRooms();

const CW_LOCATIONS = ["Semua Lokasi", "Manahan, Solo", "Citraland, Surabaya", "Sinarmas, Surabaya", "Pakuwon, Surabaya"];
const TYPES = ["Semua Tipe", "Share Desk", "Private Room", "Meeting Room", "Private Office", "Virtual Office", "Business Signage", "Overtime"];

function CWFilterAndGrid() {
  const [location, setLocation] = useStateCW("Semua Lokasi");
  const [type, setType] = useStateCW("Semua Tipe");
  const [sort, setSort] = useStateCW("rekomendasi");
  const [search, setSearch] = useStateCW("");
  const [favorites, setFavorites] = useStateCW({});
  const [detailRoom, setDetailRoom] = useStateCW(null);

  const filtered = useMemo(() => {
    let arr = ROOMS.filter(r => {
      if (location !== "Semua Lokasi" && r.loc !== location) return false;
      if (type !== "Semua Tipe" && r.type !== type) return false;
      if (search && !`${r.title} ${r.loc} ${r.type}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    if (sort === "harga-rendah") arr = [...arr].sort((a,b) => a.price - b.price);
    if (sort === "harga-tinggi") arr = [...arr].sort((a,b) => b.price - a.price);
    if (sort === "rating") arr = [...arr].sort((a,b) => b.rating - a.rating);
    return arr;
  }, [location, type, sort, search]);

  return (
    <section className="filter-section" id="rooms">
      <div className="container">
        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-field">
            <label>Cari Ruangan</label>
            <div className="filter-field-inner">
              <Icon.Search />
              <input
                placeholder="Cari nama atau lokasi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="filter-field">
            <label>Lokasi</label>
            <div className="filter-field-inner">
              <Icon.Pin />
              <select value={location} onChange={e => setLocation(e.target.value)}>
                {CW_LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="filter-field">
            <label>Tipe Ruangan</label>
            <div className="filter-field-inner">
              <Icon.Briefcase />
              <select value={type} onChange={e => setType(e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <button className="qs-search-btn">
            <CWIcon.Filter /> Terapkan
          </button>
        </div>

        {/* Quick chips */}
        <div className="filter-chips" style={{ marginBottom: 24 }}>
          <span className="filter-label">Cepat</span>
          {["Share Desk", "Private Room", "Meeting Room", "Private Office"].map(t => (
            <button
              key={t}
              className={`qtag ${type === t ? "active" : ""}`}
              onClick={() => setType(type === t ? "Semua Tipe" : t)}
            >{t}</button>
          ))}
          <div className="filter-sort">
            <span>Urutkan:</span>
            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="rekomendasi">Rekomendasi</option>
              <option value="harga-rendah">Harga: Terendah</option>
              <option value="harga-tinggi">Harga: Tertinggi</option>
              <option value="rating">Rating Tertinggi</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="results-count">
          <span className="results-count-label">
            Menampilkan <strong>{filtered.length}</strong> dari <strong>{ROOMS.length}</strong> ruangan
            {location !== "Semua Lokasi" && <> di <strong>{location}</strong></>}
          </span>
        </div>

        <div className="room-grid">
          {filtered.map(r => (
            <RoomCard
              key={r.id}
              room={r}
              fav={favorites[r.id]}
              onFav={() => setFavorites(f => ({ ...f, [r.id]: !f[r.id] }))}
              onOpen={() => openCoworking(r)}
              onAdd={() => { window.cartAdd({ kind: "coworking", type: r.type, room: r }); window.openCart(); }}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 80, color: "var(--text-tertiary)" }}>
            <div style={{ fontSize: 18, marginBottom: 8, color: "var(--text-primary)", fontWeight: 600 }}>
              Tidak ada ruangan ditemukan
            </div>
            <p style={{ marginBottom: 20 }}>Coba ubah filter atau cari dengan kata kunci lain.</p>
            <button className="btn btn-ghost" onClick={() => {
              setLocation("Semua Lokasi"); setType("Semua Tipe"); setSearch("");
            }}>Reset Filter</button>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="pagination">
            <button className="btn btn-ghost">Lihat Lebih Banyak <Icon.Arrow /></button>
          </div>
        )}
      </div>

      {detailRoom && (
        <RoomDetailModal room={detailRoom} onClose={() => setDetailRoom(null)} />
      )}
    </section>
  );
}

function openCoworking(room) {
  try { localStorage.setItem("ks_product", JSON.stringify({ kind: "coworking", type: room.type, room })); } catch (e) {}
  window.location.href = "#/product";
}

function RoomCard({ room, fav, onFav, onOpen, onAdd }) {
  const hasPackages = window.PACKAGES && window.PACKAGES[room.type];
  return (
    <div className="room-card" onClick={onOpen} style={{ cursor: "pointer" }}>
      <div className="room-media">
        <img src={room.img} alt={room.title} loading="lazy" />
        {room.badge && (
          <span className={`room-badge ${room.featured ? "featured" : ""}`}>{room.badge}</span>
        )}
        <button
          className={`room-fav ${fav ? "active" : ""}`}
          onClick={(e) => { e.stopPropagation(); onFav(); }}
          aria-label="Simpan favorit"
        >
          <CWIcon.Heart fill={fav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="room-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="room-type">{room.type}</span>
          <span className="room-rating">
            <Icon.Star /> {room.rating.toFixed(1)}
            <span className="room-rating-count">({room.reviews})</span>
          </span>
        </div>
        <h3 className="room-title">{room.title}</h3>
        <div className="room-meta">
          <span className="room-meta-item"><Icon.Pin /> {room.loc}</span>
        </div>
        <div className="room-amenities">
          <span><Icon.Users /> {room.capacity}</span>
          <span><Icon.Wifi /> {room.amenity}</span>
        </div>
        <div className="room-foot">
          <div>
            <div className="room-price-label">Mulai</div>
            <div className="room-price">
              Rp{room.price.toLocaleString("id-ID")} <small>/ {room.unit}</small>
            </div>
          </div>
          <button
            className="room-btn-pesan"
            onClick={(e) => { e.stopPropagation(); hasPackages ? onOpen() : onAdd(); }}
          >
            {hasPackages ? "Pilih Paket" : "Pesan"} <Icon.Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}

window.CWSubHero = CWSubHero;
window.CWFilterAndGrid = CWFilterAndGrid;
window.CWIcon = CWIcon;

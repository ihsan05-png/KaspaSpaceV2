/* global React */
/* ============================================
   ADMIN DATA STORE
   Shared via localStorage so the public
   Coworking Space page reads the same list.
   ============================================ */

const KASPA_ROOMS_KEY = "kaspa_rooms_v1";

const ROOM_TYPES = [
  {
    key: "Share Desk",
    desc: "Meja terbuka di area komunal, bisa dipakai siapa saja",
    unit: "hari",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    capacity: "1 org",
    amenity: "Kopi gratis",
    suggestedPrice: 25000,
  },
  {
    key: "Private Room",
    desc: "Ruang tertutup untuk fokus atau diskusi kecil 2–4 orang",
    unit: "jam",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
    capacity: "2-4 org",
    amenity: "Quiet zone",
    suggestedPrice: 60000,
  },
  {
    key: "Meeting Room",
    desc: "Ruang meeting dengan projector / TV untuk presentasi tim",
    unit: "jam",
    img: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80",
    capacity: "6-12 org",
    amenity: "Projector",
    suggestedPrice: 80000,
  },
  {
    key: "Private Office",
    desc: "Kantor pribadi siap pakai untuk tim, akses 24/7",
    unit: "bulan",
    img: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=900&q=80",
    capacity: "4-8 org",
    amenity: "Wifi 1Gbps",
    suggestedPrice: 4500000,
  },
  {
    key: "Virtual Office",
    desc: "Alamat bisnis prestige + dukungan resepsionis & PKP",
    unit: "tahun",
    img: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=900&q=80",
    capacity: "Legal",
    amenity: "PKP",
    suggestedPrice: 780000,
  },
  {
    key: "Business Signage",
    desc: "Display brand bisnis di lobi & direktori kantor",
    unit: "tahun",
    img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80",
    capacity: "Branding",
    amenity: "Display",
    suggestedPrice: 620000,
  },
  {
    key: "Overtime",
    desc: "Akses kantor 24 jam untuk lembur / shift malam",
    unit: "hari",
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
    capacity: "24/7",
    amenity: "Akses 24 jam",
    suggestedPrice: 40000,
  },
];

const ROOM_TYPE_CLASS = {
  "Share Desk": "share-desk",
  "Private Room": "private-room",
  "Meeting Room": "meeting-room",
  "Private Office": "private-office",
  "Virtual Office": "virtual-office",
  "Business Signage": "business-signage",
  "Overtime": "overtime",
};

const LOCATIONS = [
  "Manahan, Solo",
  "Citraland, Surabaya",
  "Sinarmas, Surabaya",
  "Pakuwon, Surabaya",
];

const DEFAULT_ROOMS = [
  { id: 1,  type: "Private Office", title: "Private Office Manahan", loc: "Manahan, Solo",       rating: 5.0, reviews: 4,  price: 100000,  unit: "hari",  img: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=900&q=80", badge: "Best Seller", capacity: "4-8 org", amenity: "Wifi 1Gbps", status: "active" },
  { id: 2,  type: "Virtual Office", title: "Virtual Office Solo",     loc: "Manahan, Solo",       rating: 5.0, reviews: 3,  price: 200000,  unit: "bulan", img: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=900&q=80", capacity: "Legal", amenity: "PKP", status: "active" },
  { id: 3,  type: "Share Desk",     title: "Share Desk Solo",         loc: "Manahan, Solo",       rating: 4.9, reviews: 40, price: 25000,   unit: "hari",  img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80", badge: "Populer", featured: true, capacity: "1 org", amenity: "Kopi gratis", status: "active" },
  { id: 4,  type: "Meeting Room",   title: "Meeting Room Solo",       loc: "Manahan, Solo",       rating: 4.8, reviews: 7,  price: 80000,   unit: "jam",   img: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80", capacity: "6-12 org", amenity: "Projector", status: "active" },
  { id: 5,  type: "Private Room",   title: "Private Room Focus",      loc: "Manahan, Solo",       rating: 4.9, reviews: 11, price: 60000,   unit: "jam",   img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80", badge: "Baru", capacity: "2-4 org", amenity: "Quiet zone", status: "active" },
  { id: 6,  type: "Overtime",       title: "Overtime Access Solo",    loc: "Manahan, Solo",       rating: 4.7, reviews: 12, price: 40000,   unit: "hari",  img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80", capacity: "24/7", amenity: "Akses 24 jam", status: "active" },
  { id: 7,  type: "Share Desk",     title: "Share Desk Citraland",    loc: "Citraland, Surabaya", rating: 4.8, reviews: 28, price: 100000,  unit: "hari",  img: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80", capacity: "1 org", amenity: "Wifi 1Gbps", status: "active" },
  { id: 8,  type: "Private Room",   title: "Private Room Sinarmas",   loc: "Sinarmas, Surabaya",  rating: 4.9, reviews: 9,  price: 90000,   unit: "jam",   img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80", capacity: "2-4 org", amenity: "View kota", status: "active" },
  { id: 9,  type: "Share Desk",     title: "Share Desk Pakuwon",      loc: "Pakuwon, Surabaya",   rating: 4.8, reviews: 15, price: 100000,  unit: "hari",  img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80", capacity: "1 org", amenity: "Kopi gratis", status: "active" },
  { id: 10, type: "Meeting Room",   title: "Meeting Room Citraland",  loc: "Citraland, Surabaya", rating: 4.7, reviews: 9,  price: 100000,  unit: "jam",   img: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=900&q=80", capacity: "4-10 org", amenity: "TV 55″", status: "active" },
  { id: 11, type: "Meeting Room",   title: "Meeting Room Sinarmas",   loc: "Sinarmas, Surabaya",  rating: 4.8, reviews: 11, price: 150000,  unit: "jam",   img: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80", capacity: "8-16 org", amenity: "Conference", status: "active" },
  { id: 12, type: "Private Office", title: "Private Office Pakuwon",  loc: "Pakuwon, Surabaya",   rating: 4.6, reviews: 8,  price: 250000,  unit: "hari",  img: "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?auto=format&fit=crop&w=900&q=80", capacity: "4-8 org", amenity: "Whiteboard", status: "active" },
  { id: 13, type: "Virtual Office", title: "Virtual Office Citraland",loc: "Citraland, Surabaya", rating: 4.9, reviews: 22, price: 780000,  unit: "tahun", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=900&q=80", capacity: "Legal", amenity: "Resepsionis", status: "active" },
  { id: 14, type: "Virtual Office", title: "Virtual Office Sinarmas", loc: "Sinarmas, Surabaya",  rating: 4.8, reviews: 18, price: 780000,  unit: "tahun", img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80", capacity: "Legal", amenity: "PKP", status: "active" },
  { id: 15, type: "Business Signage", title: "Business Signage Pakuwon", loc: "Pakuwon, Surabaya", rating: 4.7, reviews: 14, price: 620000, unit: "tahun", img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80", capacity: "Branding", amenity: "Display", status: "active" },
];

/* ---- Persistence helpers ---- */
function loadRooms() {
  try {
    const raw = localStorage.getItem(KASPA_ROOMS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch (e) {}
  return DEFAULT_ROOMS;
}
function saveRooms(rooms) {
  try { localStorage.setItem(KASPA_ROOMS_KEY, JSON.stringify(rooms)); } catch (e) {}
}

/* ---- Mock bookings + members (in-memory; rebuilt from rooms) ---- */
function makeBookings(rooms) {
  const names = ["Kevin Virdianto", "Sari Wulandari", "Ahmad Faisal", "Rina Pertiwi", "Bagas Pratama", "Linda Hartanto", "Yusuf Hidayat", "Dewi Anggraini"];
  const out = [];
  rooms.slice(0, 8).forEach((r, i) => {
    out.push({
      id: 1000 + i,
      code: `BK-${(2600 + i * 7).toString().padStart(4, "0")}`,
      room: r,
      member: names[i % names.length],
      date: ["18 Mei", "19 Mei", "20 Mei", "21 Mei", "22 Mei"][i % 5] + " 2026",
      slot: ["09:00–12:00", "10:00–14:00", "13:00–17:00", "08:00–10:00", "15:00–18:00"][i % 5],
      total: r.price,
      status: ["paid", "paid", "pending", "paid", "checked-in", "paid", "paid", "cancelled"][i % 8],
    });
  });
  return out;
}

window.KASPA_ROOMS_KEY = KASPA_ROOMS_KEY;
window.ROOM_TYPES = ROOM_TYPES;
window.ROOM_TYPE_CLASS = ROOM_TYPE_CLASS;
window.LOCATIONS = LOCATIONS;
window.DEFAULT_ROOMS = DEFAULT_ROOMS;
window.loadRooms = loadRooms;
window.saveRooms = saveRooms;
window.makeBookings = makeBookings;

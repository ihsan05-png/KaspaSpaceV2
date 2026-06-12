/* ============================================
   ADMIN DATA — types, constants, mock data
   ============================================ */

/* ---- Coworking product type ---- */
export interface RoomType {
  id: number;
  key: string;
  desc: string;
  unit: string;
  img: string;
  capacity: string;
  amenity: string;
  suggestedPrice: number;
  noRoom?: boolean;
}

/* ---- F&B ---- */
export interface FnbItem {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  status: 'available' | 'habis';
}

/* ---- Business Service ---- */
export interface BizService {
  id: number;
  name: string;
  description: string;
  price: number;
  unit: string;
  duration: string;
  status: 'active' | 'draft';
}

/* ---- Desk & Room ---- */
export interface Desk {
  id: number;
  number: string;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Room {
  id: number;
  products: string[];
  title: string;
  loc: string;
  rating: number;
  reviews: number;
  price: number;
  unit: string;
  img?: string;
  badge?: string;
  featured?: boolean;
  capacity: string;
  amenity: string;
  status: 'active' | 'draft' | 'archived';
  desks: Desk[];
}

/* ---- Booking & Member ---- */
export interface Booking {
  id: number;
  code: string;
  room: Room;
  member: string;
  date: string;
  slot: string;
  total: number;
  status: 'paid' | 'pending' | 'checked-in' | 'checked-out' | 'cancelled';
}

export interface FnbOrder {
  id: number;
  code: string;
  member: string;
  date: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: 'paid' | 'pending' | 'cancelled';
  note?: string;
}

export interface BizOrder {
  id: number;
  code: string;
  member: string;
  date: string;
  service: string;
  price: number;
  status: 'proses' | 'selesai' | 'cancelled';
  note?: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  plan: string;
  joinDate: string;
  status: 'active' | 'inactive';
  bookings: number;
}

/* ================================================
   DEFAULT DATA
   ================================================ */

export const DEFAULT_ROOM_TYPES: RoomType[] = [
  {
    id: 1,
    key: "Share Desk",
    desc: "Meja terbuka di area komunal, bisa dipakai siapa saja",
    unit: "hari",
    img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
    capacity: "1 org",
    amenity: "Wifi 100 Mbps",
    suggestedPrice: 25000,
  },
  {
    id: 2,
    key: "Private Room",
    desc: "Ruang tertutup untuk fokus atau diskusi kecil 2–4 orang",
    unit: "jam",
    img: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
    capacity: "2-4 org",
    amenity: "Quiet zone",
    suggestedPrice: 60000,
  },
  {
    id: 3,
    key: "Meeting Room",
    desc: "Ruang meeting dengan projector / TV untuk presentasi tim",
    unit: "jam",
    img: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=80",
    capacity: "6-12 org",
    amenity: "Projector",
    suggestedPrice: 80000,
  },
  {
    id: 4,
    key: "Private Office",
    desc: "Kantor pribadi siap pakai untuk tim, akses 24/7",
    unit: "bulan",
    img: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=900&q=80",
    capacity: "4-8 org",
    amenity: "Wifi 1Gbps",
    suggestedPrice: 4500000,
  },
  {
    id: 5,
    key: "Virtual Office",
    desc: "Sewa alamat kantor Kaspa Space sebagai alamat usaha + layanan penunjang bisnis",
    unit: "tahun",
    img: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=900&q=80",
    capacity: "—",
    amenity: "Alamat + PKP",
    suggestedPrice: 780000,
    noRoom: true,
  },
  {
    id: 6,
    key: "Business Signage",
    desc: "Display brand bisnis di lobi & direktori kantor",
    unit: "tahun",
    img: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=80",
    capacity: "Branding",
    amenity: "Display",
    suggestedPrice: 620000,
  },
  {
    id: 7,
    key: "Overtime",
    desc: "Akses kantor 24 jam untuk lembur / shift malam",
    unit: "hari",
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",
    capacity: "24/7",
    amenity: "Akses 24 jam",
    suggestedPrice: 40000,
  },
];

/* Tag CSS class helper — falls back to 'tag-default' for custom types */
const KNOWN_TYPE_CLASSES: Record<string, string> = {
  "Share Desk":       "share-desk",
  "Private Room":     "private-room",
  "Meeting Room":     "meeting-room",
  "Private Office":   "private-office",
  "Virtual Office":   "virtual-office",
  "Business Signage": "business-signage",
  "Overtime":         "overtime",
};

export function typeClass(key: string): string {
  return KNOWN_TYPE_CLASSES[key] ?? 'tag-default';
}

/* Keep backward-compat alias */
export const ROOM_TYPE_CLASS = KNOWN_TYPE_CLASSES;

/* ---- Default F&B ---- */
export const DEFAULT_FNB: FnbItem[] = [
  { id: 1, name: "Espresso",       category: "Kopi",      price: 18000, unit: "gelas", description: "Single shot espresso arabika",            status: "available" },
  { id: 2, name: "Americano",      category: "Kopi",      price: 20000, unit: "gelas", description: "Espresso diencerkan dengan air panas",     status: "available" },
  { id: 3, name: "Cappuccino",     category: "Kopi",      price: 22000, unit: "gelas", description: "Espresso + steamed milk + milk foam",      status: "available" },
  { id: 4, name: "Caramel Latte",  category: "Kopi",      price: 26000, unit: "gelas", description: "Latte dengan sirup karamel premium",       status: "available" },
  { id: 5, name: "Matcha Latte",   category: "Non-Kopi",  price: 25000, unit: "gelas", description: "Bubuk matcha Jepang + steamed milk",        status: "available" },
  { id: 6, name: "Green Tea",      category: "Non-Kopi",  price: 18000, unit: "gelas", description: "Teh hijau premium, panas atau dingin",      status: "available" },
  { id: 7, name: "Jus Jeruk",      category: "Non-Kopi",  price: 18000, unit: "gelas", description: "Jus jeruk segar tanpa gula tambahan",       status: "available" },
  { id: 8, name: "Croissant",      category: "Makanan",   price: 22000, unit: "pcs",   description: "Croissant butter panggang, renyah di luar", status: "available" },
  { id: 9, name: "Sandwich Ayam",  category: "Makanan",   price: 35000, unit: "pcs",   description: "Sandwich ayam panggang + selada + tomat",   status: "available" },
  { id: 10, name: "Pastry Mix",    category: "Makanan",   price: 28000, unit: "pcs",   description: "Pilihan pastry harian dari dapur internal",  status: "available" },
];

/* ---- Default Business Services ---- */
export const DEFAULT_BIZ: BizService[] = [
  { id: 1, name: "Pengukuhan PKP",      description: "Pengukuhan Pengusaha Kena Pajak untuk badan usaha aktif",  price: 2500000, unit: "paket", duration: "14 hari kerja", status: "active" },
  { id: 2, name: "Pendirian PT",        description: "Pendirian Perseroan Terbatas lengkap dengan akta notaris",  price: 5000000, unit: "paket", duration: "21 hari kerja", status: "active" },
  { id: 3, name: "Pengurusan NIB/SIUP", description: "Nomor Induk Berusaha dan izin usaha via OSS",              price: 1500000, unit: "paket", duration: "7 hari kerja",  status: "active" },
  { id: 4, name: "Sertifikasi ISO 9001",description: "Pendampingan & pengurusan sertifikasi ISO 9001:2015",      price: 8000000, unit: "paket", duration: "60 hari kerja", status: "active" },
  { id: 5, name: "Perizinan OSS",       description: "Pembuatan akun & pengurusan izin usaha di sistem OSS",     price: 2000000, unit: "paket", duration: "14 hari kerja", status: "active" },
  { id: 6, name: "Perubahan Akta PT",   description: "Perubahan data perseroan: direktur, pemegang saham, dll.", price: 3000000, unit: "paket", duration: "21 hari kerja", status: "draft"  },
];

/* ---- Locations ---- */
export const LOCATIONS = [
  "Manahan, Solo",
  "Citraland, Surabaya",
  "Sinarmas, Surabaya",
  "Pakuwon, Surabaya",
];

/* ---- Rooms ---- */
function makeDesks(count: number, startOccupied = 0): Desk[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    number: `M${i + 1}`,
    status: i < startOccupied ? 'occupied' : 'available',
  }));
}

export const DEFAULT_ROOMS: Room[] = [
  { id: 1,  products: ["Private Office"],             title: "Ruangan 1",  loc: "Manahan, Solo",       rating: 5.0, reviews: 4,  price: 100000,  unit: "hari",  badge: "Best Seller", capacity: "4-8 org",  amenity: "Wifi 1Gbps",   status: "active", desks: makeDesks(8, 4)  },
  { id: 2,  products: ["Share Desk"],                 title: "Ruangan 2",  loc: "Manahan, Solo",       rating: 4.9, reviews: 40, price: 25000,   unit: "hari",  badge: "Populer",     capacity: "1 org",    amenity: "Wifi 100 Mbps",  status: "active", desks: makeDesks(12, 7) },
  { id: 3,  products: ["Meeting Room"],               title: "Ruangan 3",  loc: "Manahan, Solo",       rating: 4.8, reviews: 7,  price: 80000,   unit: "jam",                         capacity: "6-12 org", amenity: "Projector",    status: "active", desks: makeDesks(12, 0) },
  { id: 4,  products: ["Private Room", "Share Desk"], title: "Ruangan 4",  loc: "Manahan, Solo",       rating: 4.9, reviews: 11, price: 60000,   unit: "jam",   badge: "Baru",        capacity: "2-4 org",  amenity: "Quiet zone",   status: "active", desks: makeDesks(4, 2)  },
  { id: 5,  products: ["Overtime"],                   title: "Ruangan 5",  loc: "Manahan, Solo",       rating: 4.7, reviews: 12, price: 40000,   unit: "hari",                        capacity: "24/7",     amenity: "Akses 24 jam", status: "active", desks: []               },
  { id: 6,  products: ["Share Desk"],                 title: "Ruangan 6",  loc: "Citraland, Surabaya", rating: 4.8, reviews: 28, price: 100000,  unit: "hari",                        capacity: "1 org",    amenity: "Wifi 1Gbps",   status: "active", desks: makeDesks(10, 5) },
  { id: 7,  products: ["Private Room"],               title: "Ruangan 7",  loc: "Sinarmas, Surabaya",  rating: 4.9, reviews: 9,  price: 90000,   unit: "jam",                         capacity: "2-4 org",  amenity: "View kota",    status: "active", desks: makeDesks(4, 1)  },
  { id: 8,  products: ["Share Desk"],                 title: "Ruangan 8",  loc: "Pakuwon, Surabaya",   rating: 4.8, reviews: 15, price: 100000,  unit: "hari",                        capacity: "1 org",    amenity: "Wifi 100 Mbps",  status: "active", desks: makeDesks(8, 3)  },
  { id: 9,  products: ["Meeting Room"],               title: "Ruangan 9",  loc: "Citraland, Surabaya", rating: 4.7, reviews: 9,  price: 100000,  unit: "jam",                         capacity: "4-10 org", amenity: "TV 55″",   status: "active", desks: makeDesks(10, 0) },
  { id: 10, products: ["Meeting Room"],               title: "Ruangan 10", loc: "Sinarmas, Surabaya",  rating: 4.8, reviews: 11, price: 150000,  unit: "jam",                         capacity: "8-16 org", amenity: "Conference",   status: "active", desks: makeDesks(16, 0) },
  { id: 11, products: ["Private Office"],             title: "Ruangan 11", loc: "Pakuwon, Surabaya",   rating: 4.6, reviews: 8,  price: 250000,  unit: "hari",                        capacity: "4-8 org",  amenity: "Whiteboard",   status: "active", desks: makeDesks(8, 6)  },
  { id: 12, products: ["Business Signage"],           title: "Ruangan 12", loc: "Pakuwon, Surabaya",   rating: 4.7, reviews: 14, price: 620000,  unit: "tahun",                       capacity: "Branding", amenity: "Display",      status: "active", desks: []               },
];

/* ---- Mock members ---- */
const MEMBER_NAMES = [
  "Kevin Virdianto", "Sari Wulandari", "Ahmad Faisal", "Rina Pertiwi",
  "Bagas Pratama", "Linda Hartanto", "Yusuf Hidayat", "Dewi Anggraini",
  "Reza Mahendra", "Anita Kusuma", "Budi Santoso", "Fitri Rahayu",
];

export const MOCK_MEMBERS: Member[] = MEMBER_NAMES.map((name, i) => ({
  id: 100 + i,
  name,
  email: `${name.split(' ')[0].toLowerCase()}@email.com`,
  phone: `+62 81${2 + i} ${String(3456 + i * 111).slice(0, 4)} ${String(7890 + i * 77).slice(0, 4)}`,
  plan: i % 3 === 0 ? "Premium" : i % 3 === 1 ? "Basic" : "Trial",
  joinDate: `${(i % 28) + 1} ${["Jan","Feb","Mar","Apr","Mei"][i % 5]} 2025`,
  status: i < 10 ? "active" : "inactive",
  bookings: Math.floor(Math.random() * 20) + 1,
}));

export function makeBookings(rooms: Room[]): Booking[] {
  const statuses: Booking['status'][] = [
    'paid', 'paid', 'pending', 'paid', 'checked-in', 'paid', 'paid', 'cancelled',
  ];
  return rooms.slice(0, 8).map((room, i) => ({
    id: 1000 + i,
    code: `BK-${(2600 + i * 7).toString().padStart(4, '0')}`,
    room,
    member: MEMBER_NAMES[i % MEMBER_NAMES.length],
    date: `${18 + (i % 5)} Mei 2026`,
    slot: ["09:00–12:00", "10:00–14:00", "13:00–17:00", "08:00–10:00", "15:00–18:00"][i % 5],
    total: room.price,
    status: statuses[i % statuses.length],
  }));
}

/* ================================================
   STORAGE KEYS + LOAD/SAVE HELPERS
   ================================================ */

export const STORAGE_KEY        = 'kaspa_rooms_v1';
export const ROOM_TYPES_KEY     = 'kaspa_coworking_types_v1';
export const FNB_KEY            = 'kaspa_fnb_v1';
export const BIZ_KEY            = 'kaspa_biz_v1';
export const FNB_ORDERS_KEY     = 'kaspa_fnb_orders_v1';
export const BIZ_ORDERS_KEY     = 'kaspa_biz_orders_v1';

function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const arr = JSON.parse(raw) as unknown;
      if (Array.isArray(arr) && arr.length > 0) return arr as T[];
    }
  } catch { /* fall through */ }
  return fallback;
}

function saveList<T>(key: string, items: T[]): void {
  try { localStorage.setItem(key, JSON.stringify(items)); } catch { /* ignore */ }
}

export const loadRooms      = () => loadList<Room>(STORAGE_KEY, DEFAULT_ROOMS);
export const saveRooms      = (r: Room[])       => saveList(STORAGE_KEY, r);

export const loadRoomTypes  = () => loadList<RoomType>(ROOM_TYPES_KEY, DEFAULT_ROOM_TYPES);
export const saveRoomTypes  = (t: RoomType[])   => saveList(ROOM_TYPES_KEY, t);

export const loadFnb        = () => loadList<FnbItem>(FNB_KEY, DEFAULT_FNB);
export const saveFnb        = (f: FnbItem[])    => saveList(FNB_KEY, f);

export const loadBiz        = () => loadList<BizService>(BIZ_KEY, DEFAULT_BIZ);
export const saveBiz        = (b: BizService[]) => saveList(BIZ_KEY, b);

/* ---- Mock FnbOrders ---- */
export const DEFAULT_FNB_ORDERS: FnbOrder[] = [
  {
    id: 2000, code: 'FO-0001', member: 'Kevin Virdianto', date: '18 Mei 2026',
    items: [{ name: 'Americano', qty: 2, price: 20000 }, { name: 'Croissant', qty: 1, price: 22000 }],
    total: 62000, status: 'paid',
  },
  {
    id: 2001, code: 'FO-0002', member: 'Sari Wulandari', date: '19 Mei 2026',
    items: [{ name: 'Matcha Latte', qty: 1, price: 25000 }, { name: 'Sandwich Ayam', qty: 1, price: 35000 }],
    total: 60000, status: 'paid',
  },
  {
    id: 2002, code: 'FO-0003', member: 'Ahmad Faisal', date: '19 Mei 2026',
    items: [{ name: 'Espresso', qty: 3, price: 18000 }],
    total: 54000, status: 'pending',
  },
  {
    id: 2003, code: 'FO-0004', member: 'Rina Pertiwi', date: '20 Mei 2026',
    items: [{ name: 'Cappuccino', qty: 2, price: 22000 }, { name: 'Pastry Mix', qty: 2, price: 28000 }],
    total: 100000, status: 'paid',
  },
  {
    id: 2004, code: 'FO-0005', member: 'Bagas Pratama', date: '21 Mei 2026',
    items: [{ name: 'Caramel Latte', qty: 1, price: 26000 }],
    total: 26000, status: 'cancelled', note: 'Pesanan dibatalkan oleh member',
  },
  {
    id: 2005, code: 'FO-0006', member: 'Linda Hartanto', date: '22 Mei 2026',
    items: [{ name: 'Green Tea', qty: 2, price: 18000 }, { name: 'Jus Jeruk', qty: 1, price: 18000 }],
    total: 54000, status: 'pending',
  },
];

/* ---- Mock BizOrders ---- */
export const DEFAULT_BIZ_ORDERS: BizOrder[] = [
  { id: 3000, code: 'BS-0001', member: 'Yusuf Hidayat',   date: '15 Mei 2026', service: 'Pendirian PT',        price: 5000000, status: 'proses'  },
  { id: 3001, code: 'BS-0002', member: 'Dewi Anggraini',  date: '16 Mei 2026', service: 'Pengukuhan PKP',      price: 2500000, status: 'selesai' },
  { id: 3002, code: 'BS-0003', member: 'Reza Mahendra',   date: '17 Mei 2026', service: 'Pengurusan NIB/SIUP', price: 1500000, status: 'proses'  },
  { id: 3003, code: 'BS-0004', member: 'Anita Kusuma',    date: '18 Mei 2026', service: 'Perizinan OSS',       price: 2000000, status: 'selesai' },
  { id: 3004, code: 'BS-0005', member: 'Budi Santoso',    date: '20 Mei 2026', service: 'Sertifikasi ISO 9001',price: 8000000, status: 'proses', note: 'Dalam tahap audit dokumen' },
  { id: 3005, code: 'BS-0006', member: 'Fitri Rahayu',    date: '22 Mei 2026', service: 'Perubahan Akta PT',   price: 3000000, status: 'cancelled', note: 'Dokumen tidak lengkap' },
];

export const loadFnbOrders  = () => loadList<FnbOrder>(FNB_ORDERS_KEY, DEFAULT_FNB_ORDERS);
export const saveFnbOrders  = (o: FnbOrder[])  => saveList(FNB_ORDERS_KEY, o);
export const loadBizOrders  = () => loadList<BizOrder>(BIZ_ORDERS_KEY, DEFAULT_BIZ_ORDERS);
export const saveBizOrders  = (o: BizOrder[])  => saveList(BIZ_ORDERS_KEY, o);

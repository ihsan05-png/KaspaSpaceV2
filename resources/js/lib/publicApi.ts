import { apiFetch } from './api';

export interface FnbItemApi {
  id: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string | null;
  image: string | null;
  images: string[] | null;
  packages: { name: string; price: number }[] | null;
  status: string;
  sort_order: number;
}

export interface RoomApi {
  id: number;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  unit: string;
  badge: string | null;
  featured: boolean;
  capacity: string | null;
  amenity: string | null;
  status: string;
  products: string[];
  desks_total: number;
  desks_avail: number;
}

export interface BizServiceApi {
  id: number;
  name: string;
  category: string;
  description: string | null;
  photo: string | null;
  photos: string[] | null;
  price: number;
  packages: { name: string; price: number }[] | null;
  location: string | null;
  duration: string | null;
  requires_documents: boolean;
  status: string;
  sort_order: number;
}

export interface VoPackageApi {
  id: number;
  tier: string;
  tagline: string | null;
  price: number;
  unit: string;
  features: string[];
  popular: boolean;
  sort_order: number;
  active: boolean;
}

export interface VoBundleApi {
  id: number;
  name: string;
  price: number;
  unit: string;
  features: string[];
  sort_order: number;
  active: boolean;
}

export interface BookingApi {
  id: number;
  code: string;
  invoice_no: string | null;
  room: { id: number; title: string; location: string } | null;
  product_type_key: string;
  booking_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  qty_desks: number;
  total_price: number;
  admin_fee: number;
  status: string;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  vo_package: { id: number; tier: string } | null;
  vo_bundle: { id: number; name: string } | null;
}

export const fetchPublicRooms = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch<RoomApi[]>(`/api/rooms${qs}`);
};

export interface ScheduleRoomApi {
  id: number;
  title: string;
  location: string;
  capacity: string | null;
  products: string[];
  desks_total: number;
  slots: Record<number, 'available' | 'booked'>;
}

export const fetchSchedule = (date: string) =>
  apiFetch<{ date: string; rooms: ScheduleRoomApi[] }>(`/api/availability/schedule?date=${date}`);

export interface MatrixProductType {
  key: string;
  status: 'available' | 'full' | 'not_available';
  total_desks?: number;
  available_desks?: number;
  booking: { inv: string | null; start_time: string | null; end_time: string | null; booking_date?: string | null; end_date?: string | null } | null;
}
export interface MatrixRoomApi {
  id: number;
  title: string;
  location: string;
  product_types: MatrixProductType[];
}
export const fetchMatrix = (date: string) =>
  apiFetch<{ date: string; rooms: MatrixRoomApi[] }>(`/api/availability/matrix?date=${date}`);

export interface ArticleApi {
  id: number; slug: string; title: string; excerpt: string; category: string;
  author_name: string; author_role: string; image_url: string | null;
  read_time: string; featured: boolean; published_at: string | null;
  body?: unknown[];
}
export const fetchArticles = () => apiFetch<ArticleApi[]>('/api/articles');
export const fetchArticle  = (slug: string) => apiFetch<ArticleApi>(`/api/articles/${slug}`);

export const fetchPublicFnbItems = () =>
  apiFetch<FnbItemApi[]>('/api/fnb/items');

export const fetchPublicBizServices = () =>
  apiFetch<BizServiceApi[]>('/api/biz/services');

export interface DiscountPublicApi {
  id: number; code: string; name: string; description: string | null;
  type: 'percentage' | 'fixed'; value: number;
  min_order: number; max_discount: number | null;
  quota: number | null; used_count: number;
  valid_from: string | null; valid_until: string | null;
  applicable_to: { cat: string; id: string | number; name: string }[] | null;
  color: string;
}
export const fetchActiveDiscounts = () =>
  apiFetch<DiscountPublicApi[]>('/api/discounts');

export interface PpnSettings { enabled: boolean; rate: number; }
export const fetchPpnSettings = () =>
  apiFetch<PpnSettings>('/api/settings/ppn');

export interface PaymentMethodsSettings {
  qris:     { enabled: boolean; image_url: string };
  tunai:    { enabled: boolean };
  rekening: Array<{ bank: string; number: string; holder: string }>;
  midtrans: { enabled: boolean; client_key: string; is_production: boolean };
}
export const fetchPaymentMethods = () =>
  apiFetch<PaymentMethodsSettings>('/api/settings/payment-methods');

export const fetchMidtransToken = (bookingCode: string) =>
  apiFetch<{ snap_token: string }>('/api/payments/midtrans/token', {
    method: 'POST',
    body: JSON.stringify({ booking_code: bookingCode }),
  });

export interface BookingTrack {
  code: string;
  invoice_no: string | null;
  status: string;
  product_type_key: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  qty_desks: number;
  total_price: number;
  admin_fee: number;
  notes: string | null;
  room: { title: string; location: string } | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
}
export const trackBooking = (code: string) =>
  apiFetch<BookingTrack>(`/api/bookings/track/${encodeURIComponent(code)}`);

export const cancelBookingByCode = (code: string) =>
  apiFetch<{ message: string; status: string }>(`/api/bookings/cancel/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });

export interface BizOrderTrack {
  code: string;
  status: string;
  service_name: string;
  price: number;
  discount_amount: number;
  member_name: string;
  created_at: string;
  expires_at: string | null;
}

export const trackBizOrder = (code: string) =>
  apiFetch<BizOrderTrack>(`/api/biz/orders/track/${encodeURIComponent(code)}`);

export const cancelBizOrder = (code: string) =>
  apiFetch<{ message: string; status: string }>(`/api/biz/orders/cancel/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });

export interface FnbOrderTrack {
  code: string;
  status: string;
  member_name: string;
  total: number;
  booking_date: string;
  created_at: string;
  expires_at: string | null;
  items: Array<{ name: string; qty: number; price: number }>;
}

export const trackFnbOrder = (code: string) =>
  apiFetch<FnbOrderTrack>(`/api/fnb/orders/track/${encodeURIComponent(code)}`);

export const cancelFnbOrder = (code: string) =>
  apiFetch<{ message: string; status: string }>(`/api/fnb/orders/cancel/${encodeURIComponent(code)}`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  });

export interface UserBizOrderApi {
  id: number; code: string; biz_service_id: number;
  package_name: string | null; price: number; discount_amount: number;
  status: string; note: string | null; created_at: string;
  service: { id: number; name: string; photo: string | null } | null;
}
export const fetchUserBizOrders = () =>
  apiFetch<UserBizOrderApi[]>('/api/biz/orders');

export const validateDiscount = (code: string, subtotal: number, category?: string, product_id?: string | number) =>
  apiFetch<{ id: number; code: string; name: string; type: string; value: number; discount_amount: number }>(
    '/api/discounts/validate',
    { method: 'POST', body: JSON.stringify({ code, subtotal, category, product_id }) }
  );

export const uploadDocument = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return fetch('/api/upload/document', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '') },
    body: fd,
  }).then(async r => {
    if (!r.ok) throw new Error('Upload gagal');
    return r.json() as Promise<{ url: string; name: string }>;
  });
};

// ── Reviews ──────────────────────────────────────────────────
export interface ReviewApi {
  id: number;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: string;
}

export interface ReviewEligibility {
  eligible: boolean;
  reviewed: boolean;
  my_review: { id: number; rating: number; comment: string | null; status: string } | null;
}

export const fetchReviews = (type: string, key: string) =>
  apiFetch<ReviewApi[]>(`/api/reviews?type=${type}&key=${encodeURIComponent(key)}`);

export const checkReviewEligibility = (type: string, key: string) =>
  apiFetch<ReviewEligibility>(`/api/reviews/eligibility?type=${type}&key=${encodeURIComponent(key)}`);

export const submitReview = (body: { reviewable_type: string; reviewable_key: string; rating: number; comment?: string }) =>
  apiFetch<ReviewApi>('/api/reviews', { method: 'POST', body: JSON.stringify(body) });

export interface UserFnbOrderApi {
  id: number; code: string;
  total: number; status: string; note: string | null;
  booking_date: string; created_at: string;
  items: { name: string; qty: number; price: number }[];
}
export const fetchUserFnbOrders = () =>
  apiFetch<UserFnbOrderApi[]>('/api/fnb/orders');

export const createFnbOrder = (body: {
  member_name: string;
  booking_date: string;
  items: Array<{ id: number; qty: number; package_name?: string }>;
  note?: string;
  discount_code?: string;
  discount_amount?: number;
  linked_cw?: string;
  linked_group?: string;
}) => apiFetch<{ code: string; status: string }>('/api/fnb/orders', {
  method: 'POST',
  body: JSON.stringify(body),
});

export const createBizOrder = (body: {
  biz_service_id: number;
  member_name: string;
  member_email?: string;
  member_phone?: string;
  package_name?: string;
  note?: string;
  documents?: { name: string; url: string }[];
  discount_code?: string;
  linked_cw?: string;
  linked_group?: string;
}) => apiFetch<{ id: number; code: string; status: string }>('/api/biz/orders', {
  method: 'POST',
  body: JSON.stringify(body),
});

export const fetchPublicVoPackages = () =>
  apiFetch<{ packages: VoPackageApi[]; bundles: VoBundleApi[] }>('/api/vo-packages');

export const fetchUserBookings = () =>
  apiFetch<BookingApi[]>('/api/bookings');

export interface OvertimeScheduleApi {
  id: number;
  room_id: number;
  room: { id: number; title: string };
  day_of_week: number;
  start_time: string;
  end_time: string;
  active: boolean;
}

export interface AvailabilityResult {
  available?: boolean;
  available_desks?: number;
  total_desks?: number;
  schedule?: { start_time: string; end_time: string };
  reason?: string;
}

export const fetchOvertimeSchedules = (roomId: number) =>
  apiFetch<OvertimeScheduleApi[]>(`/api/overtime/schedules?room_id=${roomId}`);

export const checkRoomAvailability = (
  roomId: number,
  params: { product_type: string; date: string; start_time?: string; end_time?: string }
) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined)) as Record<string, string>
  ).toString();
  return apiFetch<AvailabilityResult>(`/api/rooms/${roomId}/availability?${qs}`);
};

export interface ProductTypeApi {
  id: number;
  key: string;
  name: string;
  description: string | null;
  unit: string;
  suggested_price: number;
  location: string | null;
  images: string[] | null;
  image: string | null;
  amenity: string | null;
  capacity: string | null;
  badge: string | null;
  prices: Array<{ label: string; price: number; unit: string; booking_type?: string }> | null;
  rating: number;
  reviews: number;
  requires_documents: boolean;
}
export const fetchPublicProductTypes = () =>
  apiFetch<ProductTypeApi[]>('/api/product-types');

export const createBooking = (body: {
  room_id?: number | null;
  product_type_key: string;
  booking_date: string;
  start_time?: string | null;
  end_time?: string | null;
  qty_desks?: number;
  vo_package_id?: number | null;
  vo_bundle_id?: number | null;
  notes?: string | null;
  unit_price?: number | null;
  discount_code?: string | null;
  documents?: { name: string; url: string }[] | null;
  duration_months?: number;
  bundled_items?: Array<{ cat: string; title: string; variantName: string; price: number; discount: number; discountCode: string }> | null;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
}) => apiFetch<BookingApi>('/api/bookings', { method: 'POST', body: JSON.stringify(body) });

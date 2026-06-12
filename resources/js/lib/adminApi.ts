/* Admin API helper — thin wrapper around apiFetch */
import { apiFetch } from './api';

const a = (path: string) => `/api/admin/${path}`;

// ── Generic ──────────────────────────────────────────────────
export const adminGet  = <T>(path: string)                 => apiFetch<T>(a(path));
export const adminPost = <T>(path: string, body: unknown)  => apiFetch<T>(a(path), { method: 'POST',   body: JSON.stringify(body) });
export const adminPut  = <T>(path: string, body: unknown)  => apiFetch<T>(a(path), { method: 'PUT',    body: JSON.stringify(body) });
export const adminPatch= <T>(path: string, body: unknown)  => apiFetch<T>(a(path), { method: 'PATCH',  body: JSON.stringify(body) });
export const adminDel  =    (path: string)                 => apiFetch<void>(a(path), { method: 'DELETE' });

// ── Stats ─────────────────────────────────────────────────────
export const fetchStats = () => adminGet<{
  total: number; pending: number; paid: number; checkedin: number; checkedout: number; cancelled: number; revenue: number;
}>('stats');

export interface RecentTransaction {
  type: 'coworking' | 'fnb' | 'biz';
  code: string; label: string; name: string;
  total: number; status: string; at: string;
}
export const fetchRecentTransactions = () => adminGet<RecentTransaction[]>('transactions/recent');

// ── Rooms ─────────────────────────────────────────────────────
export interface ApiDesk { id: number; room_id?: number; number: string; status: string; }

export interface ApiRoom {
  id: number; title: string; location: string; rating: number; reviews: number;
  price: number; unit: string; badge: string | null; featured: boolean;
  capacity: string | null; amenity: string | null; status: string;
  products: string[]; desks_total: number; desks_avail: number;
  desks: ApiDesk[];
}

export const fetchRooms       = ()                        => adminGet<ApiRoom[]>('rooms');
export const createRoom       = (body: unknown)           => adminPost<ApiRoom>('rooms', body);
export const updateRoom       = (id: number, body: unknown) => adminPut<ApiRoom>(`rooms/${id}`, body);
export const deleteRoom       = (id: number)              => adminDel(`rooms/${id}`);
export const addDesk          = (roomId: number, body: unknown) => adminPost<ApiDesk>(`rooms/${roomId}/desks`, body);
export const updateDesk       = (roomId: number, deskId: number, body: unknown) => adminPut<ApiDesk>(`rooms/${roomId}/desks/${deskId}`, body);
export const removeDesk       = (roomId: number, deskId: number) => adminDel(`rooms/${roomId}/desks/${deskId}`);

// ── Product types ─────────────────────────────────────────────
export interface PriceTier {
  label:           string;
  price:           number;
  unit:            string;
  booking_type:    string;
  duration_months?: number;
}

export interface ApiProductType {
  id: number; key: string; name: string; description: string | null; unit: string;
  image: string | null; images: string[] | null;
  capacity: string | null; amenity: string | null;
  suggested_price: number; prices: PriceTier[] | null; badge: string | null;
  location: string | null;
  no_room: boolean; requires_documents: boolean; sort_order: number; status: string;
}
export const fetchProductTypes  = ()                        => adminGet<ApiProductType[]>('product-types');
export const createProductType  = (body: unknown)           => adminPost<ApiProductType>('product-types', body);
export const updateProductType  = (id: number, body: unknown) => adminPut<ApiProductType>(`product-types/${id}`, body);
export const deleteProductType  = (id: number)              => adminDel(`product-types/${id}`);

// ── Bookings ──────────────────────────────────────────────────
export interface ApiBooking {
  id: number; code: string; invoice_no: string | null;
  user: { id: number; name: string; email: string } | null;
  guest_name: string | null; guest_email: string | null; guest_phone: string | null;
  room: { id: number; title: string; location: string } | null;
  product_type_key: string; booking_date: string; end_date: string | null;
  start_time: string | null; end_time: string | null; qty_desks: number; total_price: number; admin_fee: number;
  status: string; notes: string | null; created_at: string; paid_at: string | null;
  vo_package?: { id: number; tier: string } | null;
  vo_bundle?: { id: number; name: string } | null;
  documents?: { name: string; url: string }[] | null;
}
export const fetchAdminBookings = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return adminGet<{ data: ApiBooking[]; total: number }>(`bookings${qs}`);
};
export const updateBookingStatus = (id: number, status: string) =>
  adminPatch<ApiBooking>(`bookings/${id}/status`, { status });
export const deleteBooking       = (id: number)              => adminDel(`bookings/${id}`);

// ── FnB items ─────────────────────────────────────────────────
export interface FnbPackage { name: string; price: number; }

export interface ApiFnbItem {
  id: number; name: string; category: string; price: number; unit: string;
  packages: FnbPackage[] | null; location: string | null;
  description: string | null; image: string | null; images: string[] | null;
  status: string; sort_order: number;
}
export const fetchFnbItems    = ()                        => adminGet<ApiFnbItem[]>('fnb/items');
export const createFnbItem    = (body: unknown)           => adminPost<ApiFnbItem>('fnb/items', body);
export const updateFnbItem    = (id: number, body: unknown) => adminPut<ApiFnbItem>(`fnb/items/${id}`, body);
export const deleteFnbItem    = (id: number)              => adminDel(`fnb/items/${id}`);

// ── FnB orders ────────────────────────────────────────────────
export interface ApiFnbOrder {
  id: number; code: string; member_name: string; booking_date: string; total: number;
  status: string; note: string | null; created_at: string;
  items: { id: number; name: string; qty: number; price: number }[];
}
export const fetchFnbOrders        = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return adminGet<{ data: ApiFnbOrder[]; total: number }>(`fnb/orders${qs}`);
};
export const updateFnbOrderStatus  = (id: number, status: string) =>
  adminPatch<ApiFnbOrder>(`fnb/orders/${id}/status`, { status });

// ── Biz services ──────────────────────────────────────────────
export interface BizPackage { name: string; price: number; }

export interface ApiBizService {
  id: number; name: string; category: string; description: string | null;
  photo: string | null; photos: string[] | null;
  price: number; packages: BizPackage[] | null; location: string | null;
  duration: string | null; requires_documents: boolean; status: string; sort_order: number;
}
export const fetchBizServices  = ()                        => adminGet<ApiBizService[]>('biz/services');
export const createBizService  = (body: unknown)           => adminPost<ApiBizService>('biz/services', body);
export const updateBizService  = (id: number, body: unknown) => adminPut<ApiBizService>(`biz/services/${id}`, body);
export const deleteBizService  = (id: number)              => adminDel(`biz/services/${id}`);

// ── Biz orders ────────────────────────────────────────────────
export interface ApiBizOrder {
  id: number; code: string;
  member_name: string; member_email: string | null; member_phone: string | null;
  package_name: string | null;
  price: number; discount_code: string | null; discount_amount: number;
  status: string; note: string | null; created_at: string;
  documents: { name: string; url: string }[] | null;
  service: { id: number; name: string } | null;
  user: { id: number; name: string; email: string } | null;
}
export const fetchBizOrders       = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return adminGet<{ data: ApiBizOrder[]; total: number }>(`biz/orders${qs}`);
};
export const updateBizOrderStatus = (id: number, status: string) =>
  adminPatch<ApiBizOrder>(`biz/orders/${id}/status`, { status });

// ── VO packages ───────────────────────────────────────────────
export interface ApiVoPackage {
  id: number; tier: string; tagline: string | null; price: number; unit: string;
  features: string[]; popular: boolean; sort_order: number; active: boolean;
}
export interface ApiVoBundle {
  id: number; name: string; price: number; unit: string;
  features: string[]; sort_order: number; active: boolean;
}
export const fetchVoPackages   = ()                        => adminGet<ApiVoPackage[]>('vo/packages');
export const createVoPackage   = (body: unknown)           => adminPost<ApiVoPackage>('vo/packages', body);
export const updateVoPackage   = (id: number, body: unknown) => adminPut<ApiVoPackage>(`vo/packages/${id}`, body);
export const deleteVoPackage   = (id: number)              => adminDel(`vo/packages/${id}`);
export const fetchVoBundles    = ()                        => adminGet<ApiVoBundle[]>('vo/bundles');
export const createVoBundle    = (body: unknown)           => adminPost<ApiVoBundle>('vo/bundles', body);
export const updateVoBundle    = (id: number, body: unknown) => adminPut<ApiVoBundle>(`vo/bundles/${id}`, body);
export const deleteVoBundle    = (id: number)              => adminDel(`vo/bundles/${id}`);

// ── Reviews ───────────────────────────────────────────────────
export interface ApiReview {
  id: number;
  user: { id: number; name: string; email: string } | null;
  reviewable_type: string;
  reviewable_key: string;
  reviewable_name?: string;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}
export const fetchAdminReviews = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return adminGet<{ data: ApiReview[]; total: number }>(`reviews${qs}`);
};
export const updateReviewStatus = (id: number, status: string) =>
  adminPatch<ApiReview>(`reviews/${id}/status`, { status });
export const deleteReview = (id: number) => adminDel(`reviews/${id}`);

// ── Discounts ─────────────────────────────────────────────────
export interface DiscountProduct { cat: 'coworking' | 'fnb' | 'biz'; id: string | number; name: string; }

export interface ApiDiscount {
  id: number; code: string; name: string; description: string | null;
  type: 'percentage' | 'fixed'; value: number;
  min_order: number; max_discount: number | null;
  quota: number | null; used_count: number;
  valid_from: string | null; valid_until: string | null;
  applicable_to: DiscountProduct[] | null;
  user_ids: number[] | null;
  color: string; status: string; sort_order: number;
}
export const fetchDiscounts    = ()                          => adminGet<ApiDiscount[]>('discounts');
export const createDiscount    = (body: unknown)             => adminPost<ApiDiscount>('discounts', body);
export const updateDiscount    = (id: number, body: unknown) => adminPut<ApiDiscount>(`discounts/${id}`, body);
export const deleteDiscount    = (id: number)                => adminDel(`discounts/${id}`);

// ── Articles ──────────────────────────────────────────────────
export interface ApiArticle {
  id: number; slug: string; title: string; excerpt: string; body: unknown[] | null;
  category: string; author_name: string; author_role: string;
  image_url: string | null; read_time: string; featured: boolean;
  status: 'draft' | 'published'; published_at: string | null; sort_order: number;
  created_at: string;
}
export const fetchAdminArticles  = ()                          => adminGet<ApiArticle[]>('articles');
export const createArticle       = (body: unknown)             => adminPost<ApiArticle>('articles', body);
export const updateArticle       = (id: number, body: unknown) => adminPut<ApiArticle>(`articles/${id}`, body);
export const deleteArticle       = (id: number)                => adminDel(`articles/${id}`);

// ── Users ─────────────────────────────────────────────────────
export interface ApiUser {
  id: number; name: string; email: string; phone: string | null;
  role: string; created_at: string;
}
export const fetchUsers = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  return adminGet<{ data: ApiUser[]; total: number }>(`users${qs}`);
};

export const sendEmailToUser = (userId: number, subject: string, message: string, attachment?: File) => {
  const form = new FormData();
  form.append('subject', subject);
  form.append('message', message);
  if (attachment) form.append('attachment', attachment);
  return apiFetch<{ message: string }>(a(`users/${userId}/send-email`), { method: 'POST', body: form });
};

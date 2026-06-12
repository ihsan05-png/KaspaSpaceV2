<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Booking, Room, VoPackage, VoBundle, Discount, SiteSetting};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BookingController extends Controller
{
    public function index()
    {
        return response()->json(
            Booking::with(['room', 'voPackage', 'voBundle'])
                ->where('user_id', Auth::id())
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function show(Booking $booking)
    {
        if ($booking->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return response()->json($booking->load(['room', 'voPackage', 'voBundle', 'user']));
    }

    public function store(Request $request)
    {
        $isGuest = !Auth::check();

        $data = $request->validate([
            'room_id'          => 'nullable|exists:rooms,id',
            'product_type_key' => 'required|string',
            'booking_date'     => 'required|date|after_or_equal:today',
            'start_time'       => 'nullable|date_format:H:i',
            'end_time'         => 'nullable|date_format:H:i|after:start_time',
            'qty_desks'        => 'nullable|integer|min:1',
            'unit_price'       => 'nullable|integer|min:0',
            'vo_package_id'    => 'nullable|exists:vo_packages,id',
            'vo_bundle_id'     => 'nullable|exists:vo_bundles,id',
            'notes'            => 'nullable|string|max:500',
            'documents'        => 'nullable|array',
            'documents.*.name' => 'required|string|max:100',
            'documents.*.url'  => 'required|url',
            'duration_months'  => 'nullable|integer|min:1|max:120',
            'discount_code'    => 'nullable|string|max:30',
            'bundled_items'    => 'nullable|array',
            'guest_name'       => $isGuest ? 'required|string|max:100'  : 'nullable|string|max:100',
            'guest_email'      => $isGuest ? 'required|email|max:150'   : 'nullable|email|max:150',
            'guest_phone'      => $isGuest ? 'required|string|max:20'   : 'nullable|string|max:20',
        ]);

        $type    = $data['product_type_key'];
        $date    = $data['booking_date'];
        $start   = $data['start_time'] ?? null;
        $end     = $data['end_time']   ?? null;
        $roomId  = $data['room_id']    ?? null;
        $room    = $roomId ? Room::findOrFail($roomId) : null;
        $months  = $data['duration_months'] ?? null;
        $endDate = $months
            ? \Carbon\Carbon::parse($date)->addMonths($months)->subDay()->toDateString()
            : null;

        // ── Conflict detection ──────────────────────────────────
        if ($room) {
            $base = Booking::where('room_id', $roomId)
                ->where('booking_date', $date)
                ->whereIn('status', ['paid', 'checked-in']);

            $withOverlap = function ($query) use ($start, $end) {
                if (!$start || !$end) return $query;
                return $query->where('start_time', '<', $end)->where('end_time', '>', $start);
            };

            if ($type === 'Share Desk') {
                $totalDesks = $room->desks()->where('status', '!=', 'maintenance')->count();
                $qty        = (int) ($data['qty_desks'] ?? 1);

                // Any non-Share-Desk booking at same time blocks the room entirely
                if ($withOverlap($base->clone()->where('product_type_key', '!=', 'Share Desk'))->exists()) {
                    return response()->json(['message' => 'Ruangan sudah dipesan di waktu tersebut.'], 422);
                }

                $bookedDesks = (int) $withOverlap($base->clone()->where('product_type_key', 'Share Desk'))->sum('qty_desks');
                $available   = $totalDesks - $bookedDesks;
                if ($available < $qty) {
                    return response()->json(['message' => "Hanya tersedia {$available} meja di waktu tersebut."], 422);
                }

            } elseif (in_array($type, ['Private Room', 'Meeting Room'])) {
                if ($withOverlap($base->clone())->exists()) {
                    return response()->json(['message' => 'Ruangan sudah dipesan di waktu tersebut.'], 422);
                }

            } elseif (in_array($type, ['Private Office', 'Virtual Office'])) {
                $checkEnd = $endDate ?? $date;
                $hasConflict = Booking::where('room_id', $roomId)
                    ->whereIn('status', ['paid', 'checked-in'])
                    ->where('product_type_key', $type)
                    ->where('booking_date', '<=', $checkEnd)
                    ->where(function ($q) use ($date) {
                        $q->whereNull('end_date')->orWhere('end_date', '>=', $date);
                    })
                    ->exists();
                if ($hasConflict) {
                    return response()->json(['message' => 'Ruangan sudah dipesan pada periode tersebut.'], 422);
                }

            } elseif ($type === 'Overtime') {
                $dayOfWeek = (int) date('w', strtotime($date));
                $schedule  = $room->overtimeSchedules()
                    ->where('day_of_week', $dayOfWeek)
                    ->where('active', true)
                    ->first();

                if (!$schedule) {
                    return response()->json(['message' => 'Tidak ada jadwal overtime untuk hari tersebut.'], 422);
                }
                if ($start < $schedule->start_time || $end > $schedule->end_time) {
                    return response()->json([
                        'message' => "Waktu overtime harus dalam jadwal ({$schedule->start_time}–{$schedule->end_time}).",
                    ], 422);
                }
                // Block if any booking (any type) overlaps overtime window
                if ($withOverlap($base->clone())->exists()) {
                    return response()->json(['message' => 'Slot sudah dipesan di waktu tersebut.'], 422);
                }
            }
        }

        // ── Calculate price ─────────────────────────────────────
        $basePrice  = 0;
        $adminFee   = 0;

        if ($type === 'Virtual Office') {
            if (!empty($data['vo_package_id'])) {
                $basePrice = VoPackage::findOrFail($data['vo_package_id'])->price;
            } elseif (!empty($data['vo_bundle_id'])) {
                $basePrice = VoBundle::findOrFail($data['vo_bundle_id'])->price;
            }
        } elseif ($room) {
            $qty = (int) ($data['qty_desks'] ?? 1);
            if (!empty($data['unit_price'])) {
                $basePrice = (int) $data['unit_price'] * $qty;
            } elseif ($start && $end) {
                $hours     = (strtotime($end) - strtotime($start)) / 3600;
                $basePrice = (int) round($room->price * $hours * $qty);
            } else {
                $basePrice = $room->price * $qty;
            }
        }

        // Apply discount
        $discountAmount = 0;
        if (!empty($data['discount_code'])) {
            $discount = Discount::where('code', strtoupper($data['discount_code']))->first();
            if ($discount && $discount->isValid() && $discount->isAccessibleByUser(Auth::id())) {
                $discountAmount = $discount->calculateDiscount($basePrice);
                $discount->increment('used_count');
            }
        }

        // Apply PPN
        $ppnAmount = 0;
        if (SiteSetting::get('ppn_enabled', 'false') === 'true') {
            $ppnRate   = (int) SiteSetting::get('ppn_rate', '11');
            $ppnAmount = (int) round(($basePrice - $discountAmount) * $ppnRate / 100);
        }

        $totalPrice = $basePrice - $discountAmount + $ppnAmount;

        // Append discount info to notes so admin can display it
        $noteBase = $data['notes'] ?? null;
        if ($discountAmount > 0 && !empty($data['discount_code'])) {
            $discountTag = '[Diskon:' . strtoupper($data['discount_code']) . ',Rp' . number_format($discountAmount, 0, ',', '.') . ']';
            $noteBase    = trim(($noteBase ? $noteBase . ' ' : '') . $discountTag);
        }

        // Append bundled items (mixed checkout) so invoice can reconstruct the full order
        if (!empty($data['bundled_items']) && is_array($data['bundled_items'])) {
            $bundledTag = '[BundledItems:' . base64_encode(json_encode($data['bundled_items'])) . ']';
            $noteBase   = trim(($noteBase ? $noteBase . ' ' : '') . $bundledTag);
        }

        // ── Create booking ───────────────────────────────────────
        $year  = date('Y');
        $seq   = Booking::whereYear('created_at', $year)->count() + 1;
        $invNo = 'INV/' . $year . '/' . str_pad($seq, 4, '0', STR_PAD_LEFT);

        $booking = Booking::create([
            'code'             => 'BK-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 4)),
            'invoice_no'       => $invNo,
            'user_id'          => Auth::id() ?? null,
            'guest_name'       => $isGuest ? ($data['guest_name'] ?? null) : null,
            'guest_email'      => $isGuest ? ($data['guest_email'] ?? null) : null,
            'guest_phone'      => $isGuest ? ($data['guest_phone'] ?? null) : null,
            'room_id'          => $roomId,
            'product_type_key' => $type,
            'booking_date'     => $date,
            'end_date'         => $endDate,
            'start_time'       => $start,
            'end_time'         => $end,
            'qty_desks'        => $data['qty_desks'] ?? 1,
            'vo_package_id'    => $data['vo_package_id'] ?? null,
            'vo_bundle_id'     => $data['vo_bundle_id'] ?? null,
            'total_price'      => $totalPrice,
            'admin_fee'        => $adminFee,
            'deposit_paid'     => 0,
            'status'           => 'pending',
            'notes'            => $noteBase,
            'documents'        => !empty($data['documents']) ? $data['documents'] : null,
        ]);

        return response()->json($booking->load(['room', 'voPackage', 'voBundle']), 201);
    }

    public function track(string $code)
    {
        $booking = Booking::where('code', $code)->with('room')->first();
        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan.'], 404);
        }

        if ($booking->status === 'pending' && $booking->created_at->addHours(12)->isPast()) {
            $booking->update(['status' => 'cancelled']);
        }

        $expiresAt = $booking->status === 'pending'
            ? $booking->created_at->addHours(12)->toIso8601String()
            : null;

        return response()->json([
            'code'             => $booking->code,
            'invoice_no'       => $booking->invoice_no,
            'status'           => $booking->status,
            'product_type_key' => $booking->product_type_key,
            'booking_date'     => $booking->booking_date,
            'start_time'       => $booking->start_time,
            'end_time'         => $booking->end_time,
            'qty_desks'        => $booking->qty_desks,
            'total_price'      => $booking->total_price,
            'admin_fee'        => $booking->admin_fee,
            'notes'            => $booking->notes,
            'room'             => $booking->room ? [
                'title'    => $booking->room->title,
                'location' => $booking->room->location,
            ] : null,
            'created_at'       => $booking->created_at->toIso8601String(),
            'paid_at'          => $booking->paid_at?->toIso8601String(),
            'expires_at'       => $expiresAt,
        ]);
    }

    public function cancelByCode(string $code)
    {
        $booking = Booking::where('code', $code)->first();
        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan.'], 404);
        }

        if (in_array($booking->status, ['checked-in', 'checked-out', 'cancelled'])) {
            return response()->json(['message' => 'Booking tidak dapat dibatalkan.'], 422);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Booking berhasil dibatalkan.', 'status' => 'cancelled']);
    }

    public function cancel(Booking $booking)
    {
        $isAdmin = Auth::check() && Auth::user()->role === 'admin';
        $isOwner = Auth::check() && $booking->user_id === Auth::id();
        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        if (in_array($booking->status, ['checked-in', 'checked-out', 'cancelled'])) {
            return response()->json(['message' => 'Booking tidak dapat dibatalkan.'], 422);
        }
        $booking->update(['status' => 'cancelled']);
        return response()->json($booking);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Booking, FnbOrder, BizOrder};
use Illuminate\Http\Request;

class AdminBookingController extends Controller
{
    public function index(Request $request)
    {
        $this->syncStatuses();

        $query = Booking::with(['user', 'room', 'voPackage', 'voBundle'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('product_type')) {
            $query->where('product_type_key', $request->product_type);
        }
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('code', 'like', '%' . $request->search . '%')
                  ->orWhere('guest_name', 'like', '%' . $request->search . '%')
                  ->orWhere('guest_email', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', fn($u) => $u->where('name', 'like', '%' . $request->search . '%'));
            });
        }
        if ($request->filled('date_from')) {
            $query->where('booking_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('booking_date', '<=', $request->date_to);
        }

        $perPage = $request->get('per_page', 20);
        return response()->json($perPage === 'all' ? ['data' => $query->get(), 'total' => $query->count()] : $query->paginate((int) $perPage));
    }

    public function show(Booking $booking)
    {
        return response()->json($booking->load(['user', 'room', 'voPackage', 'voBundle']));
    }

    public function updateStatus(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,paid,checked-in,checked-out,cancelled',
        ]);
        if ($data['status'] === 'paid' && !$booking->paid_at) {
            $data['paid_at'] = now();
        }
        $booking->update($data);
        return response()->json($booking->load(['user', 'room']));
    }

    public function stats()
    {
        $cwRevenue  = (int) Booking::whereIn('status', ['paid', 'checked-in', 'checked-out'])->sum('total_price');
        $fnbRevenue = (int) FnbOrder::where('status', 'paid')->sum('total');
        $bizRevenue = (int) BizOrder::where('status', 'selesai')->selectRaw('COALESCE(SUM(price - discount_amount), 0)')->value('COALESCE(SUM(price - discount_amount), 0)');

        return response()->json([
            'total'     => Booking::count() + FnbOrder::count() + BizOrder::count(),
            'pending'   => Booking::where('status', 'pending')->count()
                         + FnbOrder::where('status', 'pending')->count()
                         + BizOrder::where('status', 'pending')->count(),
            'paid'      => Booking::where('status', 'paid')->count()
                         + FnbOrder::where('status', 'paid')->count()
                         + BizOrder::where('status', 'selesai')->count(),
            'checkedin'  => Booking::where('status', 'checked-in')->count(),
            'checkedout' => Booking::where('status', 'checked-out')->count(),
            'cancelled'  => Booking::where('status', 'cancelled')->count()
                          + FnbOrder::where('status', 'cancelled')->count()
                          + BizOrder::where('status', 'cancelled')->count(),
            'revenue'   => $cwRevenue + $fnbRevenue + $bizRevenue,
        ]);
    }

    public function destroy(Booking $booking)
    {
        $booking->delete();
        return response()->json(null, 204);
    }

    public function recentTransactions()
    {
        $cw = Booking::with(['user', 'room'])
            ->orderByDesc('created_at')->limit(8)->get()
            ->map(fn($b) => [
                'type'   => 'coworking',
                'code'   => $b->code,
                'label'  => $b->product_type_key . ($b->room ? ' — ' . $b->room->title : ''),
                'name'   => $b->user?->name ?? $b->guest_name ?? '—',
                'total'  => $b->total_price + $b->admin_fee,
                'status' => $b->status,
                'at'     => $b->created_at->toIso8601String(),
            ]);

        $fnb = FnbOrder::orderByDesc('created_at')->limit(8)->get()
            ->map(fn($o) => [
                'type'   => 'fnb',
                'code'   => $o->code,
                'label'  => 'Food & Beverage',
                'name'   => $o->member_name,
                'total'  => $o->total,
                'status' => $o->status,
                'at'     => $o->created_at->toIso8601String(),
            ]);

        $biz = BizOrder::with('service')->orderByDesc('created_at')->limit(8)->get()
            ->map(fn($o) => [
                'type'   => 'biz',
                'code'   => $o->code,
                'label'  => $o->service?->name ?? 'Business Service',
                'name'   => $o->member_name,
                'total'  => $o->price - $o->discount_amount,
                'status' => $o->status,
                'at'     => $o->created_at->toIso8601String(),
            ]);

        $all = $cw->concat($fnb)->concat($biz)
            ->sortByDesc('at')
            ->values()
            ->take(8);

        return response()->json($all);
    }

    private function syncStatuses(): void
    {
        $now   = now();
        $today = $now->toDateString();

        // paid → checked-in / checked-out
        Booking::where('status', 'paid')
            ->where('booking_date', '<=', $today)
            ->each(function (Booking $b) use ($now, $today) {
                $bDate = $b->booking_date->toDateString();
                if ($bDate < $today) {
                    $b->update(['status' => 'checked-out']);
                    return;
                }
                // booking_date == today
                if ($b->end_time && $now->format('H:i:s') >= $b->end_time) {
                    $b->update(['status' => 'checked-out']);
                } elseif ($b->start_time && $now->format('H:i:s') >= $b->start_time) {
                    $b->update(['status' => 'checked-in']);
                }
            });

        // checked-in → checked-out kalau waktu sudah habis
        Booking::where('status', 'checked-in')
            ->where('booking_date', '<=', $today)
            ->each(function (Booking $b) use ($now, $today) {
                $bDate = $b->booking_date->toDateString();
                if ($bDate < $today) {
                    $b->update(['status' => 'checked-out']);
                    return;
                }
                if ($b->end_time && $now->format('H:i:s') >= $b->end_time) {
                    $b->update(['status' => 'checked-out']);
                }
            });
    }
}

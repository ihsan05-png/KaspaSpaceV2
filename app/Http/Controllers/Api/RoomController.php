<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{Room, Booking};
use Illuminate\Http\Request;

class RoomController extends Controller {
    public function index(Request $request) {
        $query = Room::with(['productTypes', 'desks'])
            ->where('status', 'active');

        if ($request->filled('location')) {
            $query->where('location', $request->location);
        }
        if ($request->filled('product_type')) {
            $query->whereHas('productTypes', fn($q) => $q->where('key', $request->product_type));
        }

        // Calculate rating from actual reviews table
        $reviewStats = \App\Models\Review::where('reviewable_type', 'product_type')
            ->where('status', 'approved')
            ->selectRaw('reviewable_key, AVG(rating) as avg_rating, COUNT(*) as total')
            ->groupBy('reviewable_key')
            ->get()
            ->keyBy('reviewable_key');

        return response()->json($query->get()->map(function ($r) use ($reviewStats) {
            $keys  = $r->productTypes->pluck('key');
            $avgs  = $keys->map(fn($k) => $reviewStats->get($k)?->avg_rating)->filter();
            $count = $keys->sum(fn($k) => $reviewStats->get($k)?->total ?? 0);
            return [
                'id'           => $r->id,
                'title'        => $r->title,
                'location'     => $r->location,
                'rating'       => $avgs->count() ? round($avgs->avg(), 1) : 0,
                'reviews'      => (int) $count,
                'price'        => $r->price,
                'unit'         => $r->unit,
                'badge'        => $r->badge,
                'featured'     => $r->featured,
                'capacity'     => $r->capacity,
                'amenity'      => $r->amenity,
                'status'       => $r->status,
                'products'     => $r->productTypes->pluck('key'),
                'desks_total'  => $r->desks->count(),
                'desks_avail'  => $r->desks->where('status', 'available')->count(),
            ];
        }));
    }

    public function availability(Request $request, Room $room) {
        $request->validate([
            'product_type' => 'required|string',
            'date'         => 'required|date',
            'start_time'   => 'nullable|date_format:H:i',
            'end_time'     => 'nullable|date_format:H:i',
        ]);

        $type  = $request->product_type;
        $date  = $request->date;
        $start = $request->start_time;
        $end   = $request->end_time;

        // Base query: active bookings on same room+date (not cancelled)
        $baseQuery = Booking::where('room_id', $room->id)
            ->where('booking_date', $date)
            ->whereIn('status', ['paid', 'checked-in']);

        // Time overlap helper
        $hasOverlap = function($query) use ($start, $end) {
            if (!$start || !$end) return $query;
            return $query->where(function($q) use ($start, $end) {
                $q->where('start_time', '<', $end)
                  ->where('end_time', '>', $start);
            });
        };

        if ($type === 'Share Desk') {
            $totalDesks  = $room->desks()->where('status', '!=', 'maintenance')->count();
            $bookedDesks = $hasOverlap($baseQuery->clone()->where('product_type_key', 'Share Desk'))->sum('qty_desks');
            // Any non-Share-Desk booking in same room+time blocks the whole room
            $blocked = $hasOverlap($baseQuery->clone()->where('product_type_key', '!=', 'Share Desk'))->exists();
            $available = $blocked ? 0 : max(0, $totalDesks - $bookedDesks);
            return response()->json(['available_desks' => $available, 'total_desks' => $totalDesks]);
        }

        // Private Room and Meeting Room: any booking in same room with overlapping time
        if (in_array($type, ['Private Room', 'Meeting Room'])) {
            $booked = $hasOverlap($baseQuery->clone())->exists();
            return response()->json(['available' => !$booked]);
        }

        if ($type === 'Private Office') {
            // If time given, check overlap; otherwise full-day block
            $booked = ($start && $end)
                ? $hasOverlap($baseQuery->clone())->exists()
                : $baseQuery->clone()->exists();
            return response()->json(['available' => !$booked]);
        }

        if ($type === 'Overtime') {
            $dayOfWeek = (int) date('w', strtotime($date));
            $schedule = $room->overtimeSchedules()
                ->where('day_of_week', $dayOfWeek)
                ->where('active', true)
                ->first();
            if (!$schedule) return response()->json(['available' => false, 'reason' => 'Tidak ada jadwal overtime untuk hari ini.']);
            $fitsSchedule = (!$start || $start >= $schedule->start_time)
                && (!$end || $end <= $schedule->end_time);
            // Block if any booking (any type) overlaps overtime window
            $booked = $hasOverlap($baseQuery->clone())->exists();
            return response()->json(['available' => $fitsSchedule && !$booked, 'schedule' => $schedule]);
        }

        return response()->json(['available' => true]);
    }
}

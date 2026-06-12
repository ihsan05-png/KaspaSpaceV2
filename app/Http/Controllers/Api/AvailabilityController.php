<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Room, Booking};
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    /**
     * Ringkasan ketersediaan ruangan hari ini untuk Hero section.
     * Menghitung sisa desk/ruang berdasarkan booking aktif hari ini.
     */
    public function today()
    {
        $today  = now()->toDateString();
        $rooms  = Room::with(['productTypes', 'desks'])->where('status', 'active')->get();

        $bookingsToday = Booking::where(function ($q) use ($today) {
                $q->where('booking_date', $today)
                  ->orWhere(function ($q2) use ($today) {
                      $q2->where('booking_date', '<=', $today)
                         ->whereNotNull('end_date')
                         ->where('end_date', '>=', $today);
                  });
            })
            ->whereIn('status', ['paid', 'checked-in'])
            ->get();

        $summary = [];

        // ── Share Desk ───────────────────────────────────────────
        $shareRooms = $rooms->filter(fn($r) => $r->productTypes->pluck('key')->contains('Share Desk'));

        if ($shareRooms->isNotEmpty()) {
            $totalDesks   = $shareRooms->sum(fn($r) => $r->desks->where('status', '!=', 'maintenance')->count());
            $bookedDesks  = $bookingsToday
                ->where('product_type_key', 'Share Desk')
                ->whereIn('room_id', $shareRooms->pluck('id'))
                ->sum('qty_desks');

            $availDesks = max(0, $totalDesks - $bookedDesks);

            if ($totalDesks > 0) {
                $summary[] = [
                    'type'  => 'Share Desk',
                    'avail' => $availDesks,
                    'total' => $totalDesks,
                    'unit'  => 'meja',
                ];
            }
        }

        // ── Meeting Room ─────────────────────────────────────────
        $meetingRooms  = $rooms->filter(fn($r) => $r->productTypes->pluck('key')->contains('Meeting Room'));
        $bookedMrIds   = $bookingsToday
            ->where('product_type_key', 'Meeting Room')
            ->pluck('room_id')
            ->unique();
        $availMeeting  = $meetingRooms->whereNotIn('id', $bookedMrIds->toArray())->count();

        if ($meetingRooms->isNotEmpty()) {
            $summary[] = [
                'type'  => 'Meeting Room',
                'avail' => $availMeeting,
                'total' => $meetingRooms->count(),
                'unit'  => 'ruang',
            ];
        }

        // ── Private Office ───────────────────────────────────────
        $privateRooms  = $rooms->filter(fn($r) => $r->productTypes->pluck('key')->contains('Private Office'));
        $bookedPoIds   = $bookingsToday
            ->where('product_type_key', 'Private Office')
            ->pluck('room_id')
            ->unique();
        $availPrivate  = $privateRooms->whereNotIn('id', $bookedPoIds->toArray())->count();

        if ($privateRooms->isNotEmpty()) {
            $summary[] = [
                'type'  => 'Private Office',
                'avail' => $availPrivate,
                'total' => $privateRooms->count(),
                'unit'  => 'ruang',
            ];
        }

        // ── Total persentase ─────────────────────────────────────
        $totalAll = array_sum(array_column($summary, 'total'));
        $availAll = array_sum(array_column($summary, 'avail'));
        $pct      = $totalAll > 0 ? round(($availAll / $totalAll) * 100) : 0;

        return response()->json([
            'date'    => $today,
            'summary' => $summary,
            'total'   => $totalAll,
            'avail'   => $availAll,
            'pct'     => $pct,
        ]);
    }

    public function matrix(Request $request)
    {
        $date  = $request->get('date', now()->toDateString());
        $rooms = Room::with(['productTypes', 'desks'])->where('status', 'active')->get();

        $bookings = Booking::where(function ($q) use ($date) {
                $q->where('booking_date', $date)
                  ->orWhere(function ($q2) use ($date) {
                      $q2->where('booking_date', '<=', $date)
                         ->whereNotNull('end_date')
                         ->where('end_date', '>=', $date);
                  });
            })
            ->whereIn('status', ['paid', 'checked-in'])
            ->whereIn('room_id', $rooms->pluck('id'))
            ->get(['id', 'invoice_no', 'room_id', 'product_type_key', 'start_time', 'end_time', 'booking_date', 'end_date', 'qty_desks']);

        $coworkingKeys = ['Share Desk', 'Private Room', 'Meeting Room', 'Private Office'];

        $result = $rooms->filter(function ($room) use ($coworkingKeys, $bookings) {
            $hasConfigured = $room->productTypes->pluck('key')->intersect($coworkingKeys)->isNotEmpty();
            $hasBooking    = $bookings->where('room_id', $room->id)
                ->filter(fn($b) => in_array($b->product_type_key, $coworkingKeys))->isNotEmpty();
            return $hasConfigured || $hasBooking;
        })->map(function ($room) use ($bookings, $coworkingKeys) {
            $rb = $bookings->where('room_id', $room->id)->values();

            // Merge: product types from bridge table + types inferred from existing bookings
            $linkedKeys = $room->productTypes->pluck('key')->filter(fn($k) => in_array($k, $coworkingKeys));
            $bookedKeys = $rb->pluck('product_type_key')->filter(fn($k) => in_array($k, $coworkingKeys))->unique();
            $keys = $linkedKeys->merge($bookedKeys)->unique()->values();

            $types = $keys->map(function ($key) use ($rb, $room) {
                if ($key === 'Share Desk') {
                    $totalDesks  = $room->desks->where('status', '!=', 'maintenance')->count();
                    $shareBooks  = $rb->where('product_type_key', 'Share Desk');
                    $otherBlocks = $rb->where('product_type_key', '!=', 'Share Desk');

                    if ($otherBlocks->isNotEmpty()) {
                        return ['key' => $key, 'status' => 'not_available', 'total_desks' => $totalDesks, 'available_desks' => 0, 'booking' => null];
                    }
                    $bookedDesks = $shareBooks->sum('qty_desks');
                    $avail       = max(0, $totalDesks - $bookedDesks);
                    $latest      = $shareBooks->sortByDesc('id')->first();
                    return [
                        'key'             => $key,
                        'status'          => $avail > 0 ? 'available' : 'full',
                        'total_desks'     => $totalDesks,
                        'available_desks' => $avail,
                        'booking'         => $latest ? ['inv' => $latest->invoice_no, 'start_time' => $latest->start_time ? substr($latest->start_time, 0, 5) : null, 'end_time' => $latest->end_time ? substr($latest->end_time, 0, 5) : null] : null,
                    ];
                }

                $own   = $rb->where('product_type_key', $key)->first();
                $other = $rb->where('product_type_key', '!=', $key)->first();

                if ($own) {
                    return ['key' => $key, 'status' => 'full', 'booking' => [
                        'inv'          => $own->invoice_no,
                        'start_time'   => $own->start_time ? substr($own->start_time, 0, 5) : null,
                        'end_time'     => $own->end_time   ? substr($own->end_time,   0, 5) : null,
                        'booking_date' => $own->booking_date ? \Carbon\Carbon::parse($own->booking_date)->format('Y-m-d') : null,
                        'end_date'     => $own->end_date     ? \Carbon\Carbon::parse($own->end_date)->format('Y-m-d')     : null,
                    ]];
                }
                if ($other) {
                    return ['key' => $key, 'status' => 'not_available', 'booking' => null];
                }
                return ['key' => $key, 'status' => 'available', 'booking' => null];
            })->values();

            return [
                'id'            => $room->id,
                'title'         => $room->title,
                'location'      => $room->location,
                'product_types' => $types,
            ];
        })->values();

        return response()->json(['date' => $date, 'rooms' => $result]);
    }

    public function schedule(Request $request)
    {
        $date  = $request->get('date', now()->toDateString());
        $rooms = Room::with(['productTypes', 'desks'])->where('status', 'active')->get();

        $bookings = Booking::where(function ($q) use ($date) {
                $q->where('booking_date', $date)
                  ->orWhere(function ($q2) use ($date) {
                      $q2->where('booking_date', '<=', $date)
                         ->whereNotNull('end_date')
                         ->where('end_date', '>=', $date);
                  });
            })
            ->whereIn('status', ['paid', 'checked-in'])
            ->whereIn('room_id', $rooms->pluck('id'))
            ->get(['room_id', 'product_type_key', 'start_time', 'end_time', 'qty_desks']);

        $hours = range(8, 17);

        $result = $rooms->map(function ($room) use ($bookings, $hours) {
            $rb = $bookings->where('room_id', $room->id)->values();

            $slots = [];
            foreach ($hours as $h) {
                $s = sprintf('%02d:00:00', $h);
                $e = sprintf('%02d:00:00', $h + 1);

                $booked = $rb->first(function ($b) use ($s, $e) {
                    if (!$b->start_time || !$b->end_time) return true;
                    return $b->start_time < $e && $b->end_time > $s;
                });

                $slots[$h] = $booked ? 'booked' : 'available';
            }

            return [
                'id'          => $room->id,
                'title'       => $room->title,
                'location'    => $room->location,
                'capacity'    => $room->capacity,
                'products'    => $room->productTypes->pluck('key'),
                'desks_total' => $room->desks->where('status', '!=', 'maintenance')->count(),
                'slots'       => $slots,
            ];
        });

        return response()->json(['date' => $date, 'rooms' => $result]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Booking, SiteSetting};
use Illuminate\Http\Request;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class MidtransController extends Controller
{
    private function configure(): void
    {
        Config::$serverKey    = SiteSetting::get('midtrans_server_key', '');
        Config::$isProduction = SiteSetting::get('midtrans_is_production', 'false') === 'true';
        Config::$isSanitized  = true;
        Config::$is3ds        = true;
    }

    /** Buat Snap token untuk booking yang sudah ada */
    public function token(Request $request)
    {
        $request->validate(['booking_code' => 'required|string']);

        $booking = Booking::where('code', $request->booking_code)->first();
        if (!$booking) {
            return response()->json(['message' => 'Booking tidak ditemukan.'], 404);
        }
        if ($booking->status !== 'pending') {
            return response()->json(['message' => 'Booking sudah dibayar atau tidak valid.'], 422);
        }

        $this->configure();

        $params = [
            'transaction_details' => [
                'order_id'     => $booking->code,
                'gross_amount' => (int) $booking->total_price,
            ],
            'customer_details' => [
                'first_name' => $booking->guest_name ?? ($booking->user?->name ?? 'Guest'),
                'email'      => $booking->guest_email ?? ($booking->user?->email ?? ''),
                'phone'      => $booking->guest_phone ?? '',
            ],
            'item_details' => [[
                'id'       => $booking->product_type_key,
                'price'    => (int) $booking->total_price,
                'quantity' => 1,
                'name'     => substr($booking->product_type_key . ' · ' . $booking->code, 0, 50),
            ]],
        ];

        try {
            $snapToken = Snap::getSnapToken($params);
            return response()->json(['snap_token' => $snapToken]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Gagal membuat sesi pembayaran.'], 500);
        }
    }

    /** Webhook notifikasi dari server Midtrans */
    public function notification(Request $request)
    {
        $this->configure();

        try {
            $notif  = new Notification();
            $status = $notif->transaction_status;
            $order  = $notif->order_id;
            $fraud  = $notif->fraud_status;
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid notification'], 400);
        }

        $booking = Booking::where('code', $order)->first();
        if (!$booking) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($status === 'capture') {
            if ($fraud === 'accept') {
                $booking->update(['status' => 'paid', 'paid_at' => now()]);
            }
        } elseif ($status === 'settlement') {
            $booking->update(['status' => 'paid', 'paid_at' => now()]);
        } elseif (in_array($status, ['cancel', 'deny', 'expire'])) {
            if ($booking->status === 'pending') {
                $booking->update(['status' => 'cancelled']);
            }
        }

        return response()->json(['message' => 'OK']);
    }
}

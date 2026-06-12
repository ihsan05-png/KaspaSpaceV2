<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{FnbItem, FnbOrder, FnbOrderItem};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FnbController extends Controller
{
    public function items()
    {
        return response()->json(
            FnbItem::where('status', 'available')->orderBy('sort_order')->get()
        );
    }

    public function order(Request $request)
    {
        $data = $request->validate([
            'member_name'         => 'required|string|max:100',
            'booking_date'        => 'required|date',
            'items'               => 'required|array|min:1',
            'items.*.id'          => 'required|exists:fnb_items,id',
            'items.*.qty'         => 'required|integer|min:1',
            'items.*.package_name'=> 'nullable|string|max:100',
            'note'                => 'nullable|string|max:500',
            'discount_code'       => 'nullable|string|max:100',
            'discount_amount'     => 'nullable|integer|min:0',
            'linked_cw'           => 'nullable|string|max:50',
            'linked_group'        => 'nullable|string|max:50',
        ]);

        $subtotal = 0;
        $lines = [];
        foreach ($data['items'] as $line) {
            $item  = FnbItem::findOrFail($line['id']);
            $price = $item->price;

            // Gunakan harga paket jika package_name dikirim
            if (!empty($line['package_name']) && !empty($item->packages)) {
                foreach ($item->packages as $pkg) {
                    if ($pkg['name'] === $line['package_name']) {
                        $price = (int) $pkg['price'];
                        break;
                    }
                }
            }

            $sub       = $price * $line['qty'];
            $subtotal += $sub;
            $lines[] = [
                'fnb_item_id'  => $item->id,
                'name'         => $item->name . (!empty($line['package_name']) ? ' — ' . $line['package_name'] : ''),
                'qty'          => $line['qty'],
                'price'        => $price,
            ];
        }

        $discountAmount = min((int) ($data['discount_amount'] ?? 0), $subtotal);
        $total          = $subtotal - $discountAmount;

        $noteBase     = $data['note'] ?? null;
        $discountCode = $data['discount_code'] ?? null;
        $noteExtra    = $discountAmount > 0 && $discountCode
            ? '[Diskon:' . $discountCode . ',Rp' . number_format($discountAmount, 0, ',', '.') . ']'
            : null;
        $linkedTag    = !empty($data['linked_cw'])    ? '[LinkedCW:'    . $data['linked_cw']    . ']' : null;
        $groupTag     = !empty($data['linked_group']) ? '[Group:'       . $data['linked_group'] . ']' : null;
        $finalNote = trim(implode(' ', array_filter([$noteBase, $noteExtra, $linkedTag, $groupTag]))) ?: null;

        $order = FnbOrder::create([
            'code'         => 'FO-' . strtoupper(substr(md5(uniqid()), 0, 6)),
            'user_id'      => Auth::check() ? Auth::id() : null,
            'member_name'  => $data['member_name'],
            'booking_date' => $data['booking_date'],
            'total'        => $total,
            'status'       => 'pending',
            'note'         => $finalNote,
        ]);

        foreach ($lines as $line) {
            $order->items()->create($line);
        }

        return response()->json($order->load('items'), 201);
    }

    public function myOrders()
    {
        $orders = FnbOrder::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->with('items')
            ->get()
            ->map(fn($o) => [
                'id'           => $o->id,
                'code'         => $o->code,
                'total'        => $o->total,
                'status'       => $o->status,
                'note'         => $o->note,
                'booking_date' => $o->booking_date,
                'created_at'   => $o->created_at->toIso8601String(),
                'items'        => $o->items->map(fn($i) => [
                    'name' => $i->name, 'qty' => $i->qty, 'price' => $i->price,
                ]),
            ]);
        return response()->json($orders);
    }

    public function track(string $code)
    {
        $order = FnbOrder::where('code', $code)->with('items')->first();
        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        if ($order->status === 'pending' && $order->created_at->addMinutes(5)->isPast()) {
            $order->update(['status' => 'cancelled']);
        }

        $expiresAt = $order->status === 'pending'
            ? $order->created_at->addMinutes(5)->toIso8601String()
            : null;

        return response()->json([
            'code'         => $order->code,
            'status'       => $order->status,
            'member_name'  => $order->member_name,
            'total'        => $order->total,
            'booking_date' => $order->booking_date,
            'created_at'   => $order->created_at->toIso8601String(),
            'expires_at'   => $expiresAt,
            'items'        => $order->items->map(fn($i) => [
                'name'  => $i->name,
                'qty'   => $i->qty,
                'price' => $i->price,
            ]),
        ]);
    }

    public function cancelOrder(string $code)
    {
        $order = FnbOrder::where('code', $code)->first();
        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        if (in_array($order->status, ['completed', 'cancelled'])) {
            return response()->json(['message' => 'Pesanan tidak dapat dibatalkan.'], 422);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Pesanan berhasil dibatalkan.', 'status' => 'cancelled']);
    }
}

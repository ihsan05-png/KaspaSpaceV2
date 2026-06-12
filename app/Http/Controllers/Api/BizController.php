<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{BizService, BizOrder, Discount};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BizController extends Controller
{
    public function services()
    {
        return response()->json(
            BizService::where('status', 'active')->orderBy('sort_order')->get()
        );
    }

    public function myOrders()
    {
        return response()->json(
            BizOrder::with('service')
                ->where('user_id', Auth::id())
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function order(Request $request)
    {
        $data = $request->validate([
            'biz_service_id'  => 'required|exists:biz_services,id',
            'member_name'     => 'required|string|max:100',
            'member_email'    => 'nullable|email|max:150',
            'member_phone'    => 'nullable|string|max:30',
            'package_name'    => 'nullable|string|max:100',
            'note'            => 'nullable|string|max:1000',
            'documents'       => 'nullable|array',
            'documents.*.name'=> 'required|string|max:100',
            'documents.*.url' => 'required|url',
            'discount_code'   => 'nullable|string|max:30',
            'linked_cw'       => 'nullable|string|max:50',
            'linked_group'    => 'nullable|string|max:50',
        ]);

        $service = BizService::findOrFail($data['biz_service_id']);

        // Determine price from package or service base price
        $price = $service->price;
        if (!empty($data['package_name']) && !empty($service->packages)) {
            foreach ($service->packages as $pkg) {
                if ($pkg['name'] === $data['package_name']) {
                    $price = (int) $pkg['price'];
                    break;
                }
            }
        }

        // Apply discount if provided
        $discountAmount = 0;
        $discountCode   = null;
        if (!empty($data['discount_code'])) {
            $discount = Discount::where('code', strtoupper($data['discount_code']))->first();
            if ($discount && $discount->isValid() && $discount->isAccessibleByUser(Auth::id())) {
                $discountAmount = $discount->calculateDiscount($price);
                $discountCode   = strtoupper($data['discount_code']);
                $discount->increment('used_count');
            }
        }

        $noteBase  = $data['note'] ?? null;
        $linkedTag = !empty($data['linked_cw'])    ? '[LinkedCW:' . $data['linked_cw']    . ']' : null;
        $groupTag  = !empty($data['linked_group']) ? '[Group:'    . $data['linked_group'] . ']' : null;
        $finalNote = trim(implode(' ', array_filter([$noteBase, $linkedTag, $groupTag]))) ?: null;

        $order = BizOrder::create([
            'code'            => 'BS-' . strtoupper(substr(md5(uniqid()), 0, 6)),
            'user_id'         => Auth::id() ?? null,
            'biz_service_id'  => $service->id,
            'member_name'     => $data['member_name'],
            'member_email'    => $data['member_email'] ?? null,
            'member_phone'    => $data['member_phone'] ?? null,
            'package_name'    => $data['package_name'] ?? null,
            'price'           => $price,
            'discount_code'   => $discountCode,
            'discount_amount' => $discountAmount,
            'status'          => 'pending',
            'note'            => $finalNote,
            'documents'       => !empty($data['documents']) ? $data['documents'] : null,
        ]);

        return response()->json($order->load('service'), 201);
    }

    public function track(string $code)
    {
        $order = BizOrder::where('code', $code)->with('service')->first();
        if (!$order) {
            return response()->json(['message' => 'Pesanan tidak ditemukan.'], 404);
        }

        if ($order->status === 'pending' && $order->created_at->addHours(12)->isPast()) {
            $order->update(['status' => 'cancelled']);
        }

        $expiresAt = $order->status === 'pending'
            ? $order->created_at->addHours(12)->toIso8601String()
            : null;

        return response()->json([
            'code'            => $order->code,
            'status'          => $order->status,
            'service_name'    => $order->service?->name,
            'price'           => $order->price,
            'discount_amount' => $order->discount_amount,
            'member_name'     => $order->member_name,
            'created_at'      => $order->created_at->toIso8601String(),
            'expires_at'      => $expiresAt,
        ]);
    }

    public function cancelOrder(string $code)
    {
        $order = BizOrder::where('code', $code)->first();
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

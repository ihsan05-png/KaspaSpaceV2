<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DiscountController extends Controller
{
    public function active()
    {
        $userId = Auth::id();
        $discounts = Discount::where('status', 'active')
            ->orderBy('sort_order')
            ->get()
            ->filter(fn($d) => $d->isValid() && $d->isAccessibleByUser($userId))
            ->values();
        return response()->json($discounts);
    }

    public function validate(Request $request)
    {
        $request->validate([
            'code'       => 'required|string',
            'subtotal'   => 'required|integer|min:0',
            'category'   => 'nullable|string',
            'product_id' => 'nullable',
        ]);

        $discount = Discount::where('code', strtoupper($request->code))->first();

        if (!$discount || !$discount->isValid()) {
            return response()->json(['message' => 'Kode diskon tidak valid atau sudah habis.'], 422);
        }

        $userId = Auth::id();
        if (!$discount->isAccessibleByUser($userId)) {
            return response()->json(['message' => 'Kode diskon tidak berlaku untuk akun Anda.'], 422);
        }

        if (!empty($discount->applicable_to)) {
            if (!$request->filled('product_id') || !$discount->matchesProduct($request->category ?? '', $request->product_id)) {
                return response()->json(['message' => 'Kode diskon tidak berlaku untuk produk ini.'], 422);
            }
        }

        $amount = $discount->calculateDiscount((int) $request->subtotal);

        return response()->json([
            'id'              => $discount->id,
            'code'            => $discount->code,
            'name'            => $discount->name,
            'type'            => $discount->type,
            'value'           => $discount->value,
            'discount_amount' => $amount,
        ]);
    }
}

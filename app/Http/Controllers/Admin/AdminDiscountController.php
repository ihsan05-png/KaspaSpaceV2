<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Discount;
use Illuminate\Http\Request;

class AdminDiscountController extends Controller
{
    public function index()
    {
        return response()->json(Discount::orderBy('sort_order')->orderByDesc('created_at')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'                    => 'required|string|max:30|unique:discounts,code',
            'name'                    => 'required|string|max:100',
            'description'             => 'nullable|string',
            'type'                    => 'required|in:percentage,fixed',
            'value'                   => 'required|integer|min:1',
            'min_order'               => 'integer|min:0',
            'max_discount'            => 'nullable|integer|min:0',
            'quota'                   => 'nullable|integer|min:1',
            'valid_from'              => 'nullable|date',
            'valid_until'             => 'nullable|date|after_or_equal:valid_from',
            'applicable_to'           => 'nullable|array',
            'applicable_to.*.cat'     => 'required|string|in:coworking,fnb,biz',
            'applicable_to.*.id'      => 'required',
            'applicable_to.*.name'    => 'required|string',
            'user_ids'                => 'nullable|array',
            'user_ids.*'              => 'integer|exists:users,id',
            'color'                   => 'nullable|string|max:20',
            'status'                  => 'in:active,draft',
            'sort_order'              => 'integer|min:0',
        ]);
        $data['code'] = strtoupper($data['code']);
        return response()->json(Discount::create($data), 201);
    }

    public function update(Request $request, Discount $discount)
    {
        $data = $request->validate([
            'code'                    => 'sometimes|string|max:30|unique:discounts,code,' . $discount->id,
            'name'                    => 'sometimes|string|max:100',
            'description'             => 'nullable|string',
            'type'                    => 'sometimes|in:percentage,fixed',
            'value'                   => 'sometimes|integer|min:1',
            'min_order'               => 'integer|min:0',
            'max_discount'            => 'nullable|integer|min:0',
            'quota'                   => 'nullable|integer|min:1',
            'valid_from'              => 'nullable|date',
            'valid_until'             => 'nullable|date|after_or_equal:valid_from',
            'applicable_to'           => 'nullable|array',
            'applicable_to.*.cat'     => 'required|string|in:coworking,fnb,biz',
            'applicable_to.*.id'      => 'required',
            'applicable_to.*.name'    => 'required|string',
            'user_ids'                => 'nullable|array',
            'user_ids.*'              => 'integer|exists:users,id',
            'color'                   => 'nullable|string|max:20',
            'status'                  => 'in:active,draft',
            'sort_order'              => 'integer|min:0',
        ]);
        if (isset($data['code'])) $data['code'] = strtoupper($data['code']);
        $discount->update($data);
        return response()->json($discount);
    }

    public function destroy(Discount $discount)
    {
        $discount->delete();
        return response()->json(null, 204);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{FnbItem, FnbOrder};
use Illuminate\Http\Request;

class AdminFnbController extends Controller
{
    // Items CRUD
    public function index()
    {
        return response()->json(FnbItem::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'category'    => 'required|string|max:50',
            'price'             => 'required|integer|min:0',
            'unit'              => 'required|string|max:30',
            'packages'          => 'nullable|array',
            'packages.*.name'   => 'required|string|max:100',
            'packages.*.price'  => 'required|integer|min:0',
            'location'          => 'nullable|string|max:100',
            'description'       => 'nullable|string',
            'images'            => 'nullable|array',
            'images.*'          => 'nullable|url',
            'status'            => 'in:available,habis',
            'sort_order'        => 'integer|min:0',
        ]);

        // price = harga terendah dari packages jika ada
        if (!empty($data['packages'])) {
            $data['price'] = min(array_column($data['packages'], 'price'));
        }

        return response()->json(FnbItem::create($data), 201);
    }

    public function update(Request $request, FnbItem $fnbItem)
    {
        $data = $request->validate([
            'name'              => 'sometimes|string|max:100',
            'category'          => 'sometimes|string|max:50',
            'price'             => 'sometimes|integer|min:0',
            'unit'              => 'sometimes|string|max:30',
            'packages'          => 'nullable|array',
            'packages.*.name'   => 'required|string|max:100',
            'packages.*.price'  => 'required|integer|min:0',
            'location'          => 'nullable|string|max:100',
            'description'       => 'nullable|string',
            'images'            => 'nullable|array',
            'images.*'          => 'nullable|url',
            'status'            => 'in:available,habis',
            'sort_order'        => 'integer|min:0',
        ]);

        if (!empty($data['packages'])) {
            $data['price'] = min(array_column($data['packages'], 'price'));
        }

        $fnbItem->update($data);
        return response()->json($fnbItem);
    }

    public function destroy(FnbItem $fnbItem)
    {
        $fnbItem->delete();
        return response()->json(null, 204);
    }

    // Orders
    public function orders(Request $request)
    {
        $query = FnbOrder::with(['user', 'items'])->orderByDesc('created_at');
        if ($request->filled('status'))    $query->where('status', $request->status);
        if ($request->filled('date_from')) $query->whereDate('booking_date', '>=', $request->date_from);
        if ($request->filled('date_to'))   $query->whereDate('booking_date', '<=', $request->date_to);
        $perPage = $request->get('per_page', 20);
        return response()->json($perPage === 'all' ? ['data' => $query->get(), 'total' => $query->count()] : $query->paginate((int)$perPage));
    }

    public function updateOrderStatus(Request $request, FnbOrder $order)
    {
        $order->update($request->validate(['status' => 'required|in:paid,pending,cancelled']));
        return response()->json($order->load(['user', 'items']));
    }
}

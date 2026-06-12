<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{BizService, BizOrder};
use Illuminate\Http\Request;

class AdminBizController extends Controller
{
    public function index()
    {
        return response()->json(BizService::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'               => 'required|string|max:100',
            'category'           => 'nullable|string|max:60',
            'description'        => 'nullable|string',
            'photos'             => 'nullable|array',
            'photos.*'           => 'nullable|url',
            'price'              => 'required|integer|min:0',
            'packages'           => 'nullable|array',
            'packages.*.name'    => 'required|string|max:100',
            'packages.*.price'   => 'required|integer|min:0',
            'location'           => 'nullable|string|max:100',
            'duration'            => 'nullable|string|max:50',
            'requires_documents'  => 'boolean',
            'status'              => 'in:active,draft',
            'sort_order'          => 'integer|min:0',
        ]);
        if (!empty($data['packages'])) {
            $data['price'] = min(array_column($data['packages'], 'price'));
        }
        return response()->json(BizService::create($data), 201);
    }

    public function update(Request $request, BizService $bizService)
    {
        $data = $request->validate([
            'name'                => 'sometimes|string|max:100',
            'category'            => 'nullable|string|max:60',
            'description'         => 'nullable|string',
            'photo'               => 'nullable|url',
            'price'               => 'sometimes|integer|min:0',
            'packages'            => 'nullable|array',
            'packages.*.name'     => 'required|string|max:100',
            'packages.*.price'    => 'required|integer|min:0',
            'location'            => 'nullable|string|max:100',
            'duration'            => 'nullable|string|max:50',
            'requires_documents'  => 'boolean',
            'status'              => 'in:active,draft',
            'sort_order'          => 'integer|min:0',
        ]);
        if (!empty($data['packages'])) {
            $data['price'] = min(array_column($data['packages'], 'price'));
        }
        $bizService->update($data);
        return response()->json($bizService);
    }

    public function destroy(BizService $bizService)
    {
        $bizService->delete();
        return response()->json(null, 204);
    }

    public function orders(Request $request)
    {
        $query = BizOrder::with(['user', 'service'])->orderByDesc('created_at');
        if ($request->filled('status'))    $query->where('status', $request->status);
        if ($request->filled('date_from')) $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->filled('date_to'))   $query->whereDate('created_at', '<=', $request->date_to);
        $perPage = $request->get('per_page', 20);
        return response()->json($perPage === 'all' ? ['data' => $query->get(), 'total' => $query->count()] : $query->paginate((int)$perPage));
    }

    public function updateOrderStatus(Request $request, BizOrder $order)
    {
        $order->update($request->validate(['status' => 'required|in:pending,proses,selesai,cancelled']));
        return response()->json($order->load(['user', 'service']));
    }
}

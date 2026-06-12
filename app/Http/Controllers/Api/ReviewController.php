<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Review, BizOrder, Booking, FnbOrder};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /** Ambil review approved untuk satu produk */
    public function index(Request $request)
    {
        $request->validate(['type' => 'required|string', 'key' => 'required|string']);

        $reviews = Review::with('user:id,name')
            ->where('reviewable_type', $request->type)
            ->where('reviewable_key',  $request->key)
            ->where('status', 'approved')
            ->latest()
            ->get()
            ->map(fn($r) => [
                'id'            => $r->id,
                'rating'        => $r->rating,
                'comment'       => $r->comment,
                'reviewer_name' => $r->reviewer_name,
                'created_at'    => $r->created_at,
            ]);

        return response()->json($reviews);
    }

    /** Cek apakah user sudah beli & sudah review */
    public function eligibility(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['eligible' => false, 'reviewed' => false]);
        }

        $request->validate(['type' => 'required|string', 'key' => 'required|string']);
        $userId = Auth::id();
        $type   = $request->type;
        $key    = $request->key;

        $eligible = match($type) {
            'biz'          => BizOrder::where('user_id', $userId)
                                ->where('biz_service_id', $key)
                                ->where('status', 'selesai')
                                ->exists(),
            'product_type' => Booking::where('user_id', $userId)
                                ->where('product_type_key', $key)
                                ->whereIn('status', ['checked-in', 'checked-out'])
                                ->exists(),
            'fnb'          => FnbOrder::where('user_id', $userId)
                                ->whereHas('items', fn($q) => $q->where('fnb_item_id', $key))
                                ->exists(),
            default        => false,
        };

        $reviewed = Review::where('user_id', $userId)
            ->where('reviewable_type', $type)
            ->where('reviewable_key', $key)
            ->exists();

        $myReview = $reviewed
            ? Review::where('user_id', $userId)
                ->where('reviewable_type', $type)
                ->where('reviewable_key', $key)
                ->first(['id','rating','comment','status'])
            : null;

        return response()->json([
            'eligible' => $eligible,
            'reviewed' => $reviewed,
            'my_review'=> $myReview,
        ]);
    }

    /** Submit review baru */
    public function store(Request $request)
    {
        $data = $request->validate([
            'reviewable_type' => 'required|in:biz,product_type,fnb',
            'reviewable_key'  => 'required|string|max:100',
            'rating'          => 'required|integer|min:1|max:5',
            'comment'         => 'nullable|string|max:1000',
        ]);

        $userId = Auth::id();
        $type   = $data['reviewable_type'];
        $key    = $data['reviewable_key'];

        // Verifikasi sudah beli
        $eligible = match($type) {
            'biz'          => BizOrder::where('user_id', $userId)
                                ->where('biz_service_id', $key)
                                ->where('status', 'selesai')->exists(),
            'product_type' => Booking::where('user_id', $userId)
                                ->where('product_type_key', $key)
                                ->whereIn('status', ['checked-in','checked-out'])->exists(),
            'fnb'          => FnbOrder::where('user_id', $userId)
                                ->whereHas('items', fn($q) => $q->where('fnb_item_id', $key))
                                ->exists(),
            default        => false,
        };

        if (!$eligible) {
            return response()->json(['message' => 'Anda belum memiliki pesanan yang selesai untuk produk ini.'], 403);
        }

        $review = Review::updateOrCreate(
            ['user_id' => $userId, 'reviewable_type' => $type, 'reviewable_key' => $key],
            [
                'rating'        => $data['rating'],
                'comment'       => $data['comment'] ?? null,
                'reviewer_name' => Auth::user()->name,
                'status'        => 'pending',
            ]
        );

        return response()->json($review, 201);
    }
}

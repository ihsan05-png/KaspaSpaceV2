<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with('user:id,name,email')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('reviewable_type', $request->type);
        }
        if ($request->filled('search')) {
            $query->where(fn($q) => $q
                ->where('reviewer_name', 'like', '%' . $request->search . '%')
                ->orWhere('comment', 'like', '%' . $request->search . '%')
            );
        }

        $paginated = $query->paginate(20);
        $paginated->getCollection()->transform(function ($review) {
            $review->reviewable_name = $this->resolveReviewableName(
                $review->reviewable_type,
                $review->reviewable_key
            );
            return $review;
        });
        return response()->json($paginated);
    }

    private function resolveReviewableName(string $type, string $key): string
    {
        return match ($type) {
            'biz'          => \App\Models\BizService::find($key)?->name   ?? "Layanan #{$key}",
            'product_type' => \App\Models\ProductType::where('key', $key)->value('name') ?? $key,
            'fnb'          => \App\Models\FnbItem::find($key)?->name      ?? "Item #{$key}",
            default        => $key,
        };
    }

    public function updateStatus(Request $request, Review $review)
    {
        $review->update($request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]));
        return response()->json($review);
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->json(null, 204);
    }
}

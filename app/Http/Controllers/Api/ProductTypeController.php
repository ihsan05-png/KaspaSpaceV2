<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{ProductType, Review};

class ProductTypeController extends Controller {
    public function index() {
        $reviewStats = Review::where('reviewable_type', 'product_type')
            ->where('status', 'approved')
            ->selectRaw('reviewable_key, AVG(rating) as avg_rating, COUNT(*) as total')
            ->groupBy('reviewable_key')
            ->get()
            ->keyBy('reviewable_key');

        return response()->json(
            ProductType::where('status', 'active')
                ->orderBy('sort_order')
                ->get()
                ->map(function ($pt) use ($reviewStats) {
                    $stats = $reviewStats->get($pt->key);
                    $data  = $pt->toArray();
                    $data['rating']  = $stats ? round($stats->avg_rating, 1) : 0;
                    $data['reviews'] = $stats ? (int) $stats->total : 0;
                    return $data;
                })
        );
    }
}

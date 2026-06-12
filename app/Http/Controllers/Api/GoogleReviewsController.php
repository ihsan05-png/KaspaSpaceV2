<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\{Cache, Http, Log};

class GoogleReviewsController extends Controller
{
    /**
     * Fetch ulasan dari Google Sheets publik (CSV).
     * Gratis, tanpa API key — cukup sheet di-share "Anyone with link".
     *
     * Format kolom Google Sheet (baris pertama = header, diabaikan):
     * A = Name | B = Photo_URL | C = Rating (1-5) | D = Date | E = Review
     *
     * Cache 1 jam. Admin bisa force refresh via ?refresh=1
     */
    public function index()
    {
        $sheetsId = config('services.google.sheets_id');
        $mapsUrl  = config('services.google.maps_url');

        $empty = [
            'rating'  => 4.9,
            'total'   => 54,
            'reviews' => [],
            'maps_url'=> $mapsUrl,
            'source'  => 'no_sheet',
        ];

        if (!$sheetsId) {
            return response()->json($empty);
        }

        if (request()->boolean('refresh')) {
            Cache::forget('google_reviews');
        }

        return Cache::remember('google_reviews', 3600, function () use ($sheetsId, $mapsUrl, $empty) {
            try {
                // Export Google Sheet sebagai CSV (tanpa API key, cukup sheet publik)
                $csvUrl = "https://docs.google.com/spreadsheets/d/{$sheetsId}/export?format=csv&gid=0";

                $response = Http::timeout(10)
                    ->withoutVerifying()  // beberapa server perlu ini
                    ->get($csvUrl);

                if (!$response->successful()) {
                    Log::warning('Google Sheets fetch gagal', ['status' => $response->status()]);
                    return $empty;
                }

                $rows    = $this->parseCsv($response->body());
                $reviews = [];

                foreach ($rows as $i => $row) {
                    // Skip baris header (baris pertama)
                    if ($i === 0) continue;

                    // Pastikan kolom cukup
                    if (count($row) < 5) continue;

                    [$name, $photoUrl, $rating, $date, $text] = array_pad($row, 5, '');

                    $name   = trim($name);
                    $rating = (int) trim($rating);
                    $text   = trim($text);

                    // Skip baris kosong atau rating tidak valid
                    if (!$name || !$text || $rating < 1 || $rating > 5) continue;

                    // Hanya tampilkan ulasan bintang 4-5
                    if ($rating < 4) continue;

                    $reviews[] = [
                        'author_name'               => $name,
                        'profile_photo_url'         => trim($photoUrl) ?: null,
                        'rating'                    => $rating,
                        'relative_time_description' => trim($date) ?: '—',
                        'text'                      => $text,
                        'author_url'                => null,
                    ];
                }

                if (empty($reviews)) {
                    return $empty;
                }

                // Hitung rata-rata rating dari sheet
                $avgRating = round(array_sum(array_column($reviews, 'rating')) / count($reviews), 1);

                return [
                    'rating'  => $avgRating,
                    'total'   => count($reviews),
                    'reviews' => $reviews,
                    'maps_url'=> $mapsUrl,
                    'source'  => 'sheets',
                ];
            } catch (\Throwable $e) {
                Log::error('Google Sheets reviews error: ' . $e->getMessage());
                return $empty;
            }
        });
    }

    /**
     * Parse raw CSV string menjadi array of arrays.
     * Handle quoted fields dengan benar (termasuk yang mengandung koma/newline).
     */
    private function parseCsv(string $csv): array
    {
        $rows   = [];
        $lines  = str_getcsv($csv, "\n");

        foreach ($lines as $line) {
            if (trim($line) === '') continue;
            $rows[] = str_getcsv($line, ',', '"');
        }

        return $rows;
    }
}

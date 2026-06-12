<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;

class PublicSettingsController extends Controller
{
    private function daysDisplay(array $locHours): string
    {
        $active = array_filter($locHours, fn($h) => $h['active'] ?? false);
        if (empty($active)) return '';

        $activeDays = array_column($active, 'day');

        if (count($active) === 7) return 'Setiap hari';

        $monSat = [1, 2, 3, 4, 5, 6];
        $monFri = [1, 2, 3, 4, 5];

        if (empty(array_diff($monSat, $activeDays)) && !in_array(0, $activeDays)) {
            return 'Senin – Sabtu';
        }
        if (empty(array_diff($monFri, $activeDays)) && !in_array(6, $activeDays) && !in_array(0, $activeDays)) {
            return 'Senin – Jumat';
        }

        $abbr = [1 => 'Sen', 2 => 'Sel', 3 => 'Rab', 4 => 'Kam', 5 => 'Jum', 6 => 'Sab', 0 => 'Min'];
        usort($active, fn($a, $b) => ($a['day'] === 0 ? 7 : $a['day']) - ($b['day'] === 0 ? 7 : $b['day']));
        return implode(', ', array_map(fn($h) => $abbr[$h['day']] ?? '', $active));
    }

    private function hoursDisplay(array $locHours): string
    {
        $active = array_filter($locHours, fn($h) => $h['active'] ?? false);
        if (empty($active)) return 'Tutup';

        // Semua hari sama
        $opens  = array_unique(array_column($active, 'open'));
        $closes = array_unique(array_column($active, 'close'));
        if (count($opens) === 1 && count($closes) === 1) {
            return sprintf('%s – %s', $opens[0], $closes[0]);
        }

        // Coba pakai jam hari kerja (Senin–Sabtu, day 1–6) jika seragam
        $weekdays = array_filter($active, fn($h) => ($h['day'] ?? 0) >= 1 && ($h['day'] ?? 0) <= 6);
        if (!empty($weekdays)) {
            $wOpens  = array_unique(array_column($weekdays, 'open'));
            $wCloses = array_unique(array_column($weekdays, 'close'));
            if (count($wOpens) === 1 && count($wCloses) === 1) {
                return sprintf('%s – %s', $wOpens[0], $wCloses[0]);
            }
        }

        return 'Lihat jadwal';
    }

    /** Daftar lokasi dengan jam operasional — untuk halaman Tentang */
    public function locations()
    {
        $locs   = json_decode(SiteSetting::get('locations', '[]'), true) ?? [];
        $allHrs = json_decode(SiteSetting::get('operational_hours', '{}'), true) ?? [];

        if (array_is_list($allHrs)) $allHrs = [];

        $result = array_map(function ($loc) use ($allHrs) {
            $locHours = $allHrs[$loc['label']] ?? [];
            return array_merge($loc, [
                'hours_display' => $this->hoursDisplay($locHours),
                'days_display'  => $this->daysDisplay($locHours),
            ]);
        }, $locs);

        return response()->json($result);
    }

    /** Konfigurasi PPN untuk checkout */
    public function ppn()
    {
        return response()->json([
            'enabled' => SiteSetting::get('ppn_enabled', 'false') === 'true',
            'rate'    => (int) SiteSetting::get('ppn_rate', '11'),
        ]);
    }

    /** Metode pembayaran yang aktif — untuk checkout */
    public function paymentMethods()
    {
        $raw  = SiteSetting::get('payment_methods', null);
        $data = $raw ? (json_decode($raw, true) ?? []) : [];
        return response()->json([
            'qris'     => $data['qris']     ?? ['enabled' => false, 'image_url' => ''],
            'tunai'    => $data['tunai']     ?? ['enabled' => false],
            'rekening' => $data['rekening']  ?? [],
            'midtrans' => [
                'enabled'       => SiteSetting::get('midtrans_enabled', 'false') === 'true',
                'client_key'    => SiteSetting::get('midtrans_client_key', ''),
                'is_production' => SiteSetting::get('midtrans_is_production', 'false') === 'true',
            ],
        ]);
    }

    /** Jam operasional — lokasi pertama untuk FnB/Hero + semua lokasi untuk booking */
    public function operationalHours()
    {
        $allHrs = json_decode(SiteSetting::get('operational_hours', '{}'), true) ?? [];

        $hours = array_is_list($allHrs) ? $allHrs : (!empty($allHrs) ? reset($allHrs) : []);

        $active      = array_filter($hours, fn($h) => $h['active'] ?? false);
        $opens       = array_unique(array_column($active, 'open'));
        $closes      = array_unique(array_column($active, 'close'));
        $displayText = (count($opens) === 1 && count($closes) === 1)
            ? sprintf('%s – %s', $opens[0], $closes[0])
            : 'Lihat jadwal';

        // by_location: per-location hours for the booking time picker
        $byLocation = array_is_list($allHrs) ? [] : $allHrs;

        return response()->json([
            'hours'        => $hours,
            'display_text' => $displayText,
            'active_days'  => array_values(array_map(fn($h) => $h['label'], $active)),
            'by_location'  => $byLocation,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    private function defaultLocations(): array
    {
        return [
            ['label' => 'Manahan, Solo',      'name' => 'Kaspa Space Manahan',  'city' => 'Solo',     'address' => 'Jl. Adi Sucipto No. 12, Manahan, Solo 57139',           'img' => 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', 'seats' => '60+ seat'],
            ['label' => 'Citraland, Surabaya', 'name' => 'Kaspa Space Citraland','city' => 'Surabaya', 'address' => 'Citraland Boulevard No. 88, Surabaya 60219',            'img' => 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1200&q=80', 'seats' => '80+ seat'],
            ['label' => 'Sinarmas, Surabaya',  'name' => 'Kaspa Space Sinarmas', 'city' => 'Surabaya', 'address' => 'Sinarmas Tower Lt. 18, Jl. Pemuda 60-66, Surabaya',    'img' => 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=1200&q=80', 'seats' => '100+ seat'],
            ['label' => 'Pakuwon, Surabaya',   'name' => 'Kaspa Space Pakuwon',  'city' => 'Surabaya', 'address' => 'Pakuwon City Mall Lt. 3, Jl. Kejawan Putih, Surabaya', 'img' => 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1200&q=80', 'seats' => '70+ seat'],
        ];
    }

    private function defaultDays(): array
    {
        return [
            ['day' => 1, 'label' => 'Senin',  'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 2, 'label' => 'Selasa', 'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 3, 'label' => 'Rabu',   'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 4, 'label' => 'Kamis',  'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 5, 'label' => 'Jumat',  'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 6, 'label' => 'Sabtu',  'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 0, 'label' => 'Minggu', 'open' => '08:00', 'close' => '20:00', 'active' => true],
        ];
    }

    private function loadLocations(): array
    {
        $raw = SiteSetting::get('locations', null);
        if ($raw === null) {
            $defaults = $this->defaultLocations();
            SiteSetting::set('locations', $defaults);
            return $defaults;
        }
        return json_decode($raw, true) ?? $this->defaultLocations();
    }

    /** Ambil semua settings termasuk lokasi dan jam operasional */
    public function index()
    {
        $locations = $this->loadLocations();
        $labels    = array_column($locations, 'label');

        $raw     = SiteSetting::get('operational_hours', '{}');
        $all     = json_decode($raw, true) ?? [];
        $changed = false;

        if (array_is_list($all)) {
            $all     = [];
            $changed = true;
        }

        foreach ($labels as $loc) {
            if (!isset($all[$loc])) {
                $all[$loc] = $this->defaultDays();
                $changed   = true;
            }
        }

        if ($changed) {
            SiteSetting::set('operational_hours', $all);
        }

        return response()->json([
            'locations'         => $locations,
            'operational_hours' => $all,
            'site_name'         => SiteSetting::get('site_name', 'Kaspa Space'),
            'site_address'      => SiteSetting::get('site_address', 'Manahan, Solo, Jawa Tengah'),
            'ppn_enabled'       => SiteSetting::get('ppn_enabled', 'false') === 'true',
            'ppn_rate'          => (int) SiteSetting::get('ppn_rate', '11'),
        ]);
    }

    /** Simpan jam operasional untuk satu lokasi */
    public function updateOperationalHours(Request $request)
    {
        $data = $request->validate([
            'location'       => 'required|string',
            'hours'          => 'required|array',
            'hours.*.day'    => 'required|integer|between:0,6',
            'hours.*.label'  => 'required|string',
            'hours.*.open'   => 'required|date_format:H:i',
            'hours.*.close'  => 'required|date_format:H:i',
            'hours.*.active' => 'required|boolean',
        ]);

        $raw = SiteSetting::get('operational_hours', '{}');
        $all = json_decode($raw, true) ?? [];
        if (array_is_list($all)) $all = [];

        $all[$data['location']] = $data['hours'];
        SiteSetting::set('operational_hours', $all);

        return response()->json([
            'message'  => "Jam operasional {$data['location']} disimpan.",
            'location' => $data['location'],
            'hours'    => $data['hours'],
        ]);
    }

    /** Update daftar lokasi (tambah / hapus) */
    public function updateLocations(Request $request)
    {
        $data = $request->validate([
            'locations'           => 'required|array',
            'locations.*.label'   => 'required|string|max:100',
            'locations.*.name'    => 'required|string|max:150',
            'locations.*.city'    => 'required|string|max:100',
            'locations.*.address' => 'required|string|max:255',
            'locations.*.img'     => 'nullable|string|max:500',
            'locations.*.seats'   => 'nullable|string|max:50',
        ]);

        $newLocations = $data['locations'];
        $newLabels    = array_column($newLocations, 'label');

        SiteSetting::set('locations', $newLocations);

        // Hapus jam operasional untuk lokasi yang dihapus
        $raw = SiteSetting::get('operational_hours', '{}');
        $all = json_decode($raw, true) ?? [];
        if (!array_is_list($all)) {
            $filtered = array_intersect_key($all, array_flip($newLabels));
            SiteSetting::set('operational_hours', $filtered);
        }

        return response()->json(['message' => 'Lokasi diperbarui.', 'locations' => $newLocations]);
    }

    private function defaultPaymentMethods(): array
    {
        return [
            'qris'     => ['enabled' => false, 'image_url' => ''],
            'tunai'    => ['enabled' => false],
            'rekening' => [],
        ];
    }

    public function getPaymentMethods()
    {
        $raw = SiteSetting::get('payment_methods', null);
        $data = $raw ? (json_decode($raw, true) ?? $this->defaultPaymentMethods()) : $this->defaultPaymentMethods();
        return response()->json($data);
    }

    public function updatePaymentMethods(Request $request)
    {
        $data = $request->validate([
            'qris'              => 'sometimes|array',
            'qris.enabled'      => 'boolean',
            'qris.image_url'    => 'nullable|string|max:1000',
            'tunai'             => 'sometimes|array',
            'tunai.enabled'     => 'boolean',
            'rekening'          => 'sometimes|array',
            'rekening.*.bank'   => 'required|string|max:50',
            'rekening.*.number' => 'required|string|max:50',
            'rekening.*.holder' => 'required|string|max:100',
        ]);
        SiteSetting::set('payment_methods', $data);
        return response()->json(['message' => 'Metode pembayaran disimpan.']);
    }

    public function getMidtrans()
    {
        return response()->json([
            'enabled'       => SiteSetting::get('midtrans_enabled', 'false') === 'true',
            'server_key'    => SiteSetting::get('midtrans_server_key', ''),
            'client_key'    => SiteSetting::get('midtrans_client_key', ''),
            'is_production' => SiteSetting::get('midtrans_is_production', 'false') === 'true',
        ]);
    }

    public function updateMidtrans(Request $request)
    {
        $data = $request->validate([
            'enabled'       => 'required|boolean',
            'server_key'    => 'nullable|string|max:255',
            'client_key'    => 'nullable|string|max:255',
            'is_production' => 'required|boolean',
        ]);
        SiteSetting::set('midtrans_enabled',       $data['enabled'] ? 'true' : 'false');
        SiteSetting::set('midtrans_server_key',    $data['server_key'] ?? '');
        SiteSetting::set('midtrans_client_key',    $data['client_key'] ?? '');
        SiteSetting::set('midtrans_is_production', $data['is_production'] ? 'true' : 'false');
        return response()->json(['message' => 'Konfigurasi Midtrans disimpan.']);
    }

    /** Simpan konfigurasi umum */
    public function updateSystem(Request $request)
    {
        $data = $request->validate([
            'site_name'    => 'sometimes|string|max:100',
            'site_address' => 'sometimes|string|max:255',
            'ppn_enabled'  => 'sometimes|boolean',
            'ppn_rate'     => 'sometimes|integer|min:0|max:100',
        ]);

        foreach ($data as $key => $value) {
            if ($key === 'ppn_enabled') {
                SiteSetting::set($key, $value ? 'true' : 'false');
            } else {
                SiteSetting::set($key, (string) $value);
            }
        }

        return response()->json(['message' => 'Konfigurasi disimpan.']);
    }
}

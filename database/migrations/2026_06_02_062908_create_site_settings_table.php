<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        $defaultLocations = [
            ['label' => 'Manahan, Solo',       'name' => 'Kaspa Space Manahan',   'city' => 'Solo',     'address' => 'Jl. Adi Sucipto No. 12, Manahan, Solo 57139',        'img' => null, 'seats' => '60+ seat'],
            ['label' => 'Citraland, Surabaya', 'name' => 'Kaspa Space Citraland', 'city' => 'Surabaya', 'address' => 'Citraland Boulevard No. 88, Surabaya 60219',           'img' => null, 'seats' => '80+ seat'],
            ['label' => 'Sinarmas, Surabaya',  'name' => 'Kaspa Space Sinarmas',  'city' => 'Surabaya', 'address' => 'Sinarmas Tower Lt. 18, Jl. Pemuda 60-66, Surabaya',   'img' => null, 'seats' => '100+ seat'],
            ['label' => 'Pakuwon, Surabaya',   'name' => 'Kaspa Space Pakuwon',   'city' => 'Surabaya', 'address' => 'Pakuwon City Mall Lt. 3, Jl. Kejawan Putih, Surabaya','img' => null, 'seats' => '70+ seat'],
        ];

        $defaultDays = [
            ['day' => 1, 'label' => 'Senin',  'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 2, 'label' => 'Selasa', 'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 3, 'label' => 'Rabu',   'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 4, 'label' => 'Kamis',  'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 5, 'label' => 'Jumat',  'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 6, 'label' => 'Sabtu',  'open' => '08:00', 'close' => '22:00', 'active' => true],
            ['day' => 0, 'label' => 'Minggu', 'open' => '08:00', 'close' => '20:00', 'active' => true],
        ];

        $defaultHours = [];
        foreach ($defaultLocations as $loc) {
            $defaultHours[$loc['label']] = $defaultDays;
        }

        \DB::table('site_settings')->insert([
            ['key' => 'locations',         'value' => json_encode($defaultLocations), 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'operational_hours', 'value' => json_encode($defaultHours),     'created_at' => now(), 'updated_at' => now()],
            ['key' => 'site_name',         'value' => 'Kaspa Space',                 'created_at' => now(), 'updated_at' => now()],
            ['key' => 'site_address',      'value' => 'Manahan, Solo, Jawa Tengah',  'created_at' => now(), 'updated_at' => now()],
            ['key' => 'ppn_enabled',       'value' => 'false',                       'created_at' => now(), 'updated_at' => now()],
            ['key' => 'ppn_rate',          'value' => '11',                          'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};

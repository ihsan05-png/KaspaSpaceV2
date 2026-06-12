<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('vo_packages', function (Blueprint $table) {
            $table->id();
            $table->enum('tier', ['Bronze', 'Platinum', 'Gold', 'Diamond']);
            $table->string('tagline')->nullable();
            $table->unsignedInteger('price');
            $table->string('unit', 20)->default('tahun');
            $table->json('features')->nullable();
            $table->boolean('popular')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('vo_packages'); }
};

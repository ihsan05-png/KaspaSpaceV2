<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('room_product_type', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_type_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['room_id', 'product_type_id']);
        });
    }
    public function down(): void { Schema::dropIfExists('room_product_type'); }
};

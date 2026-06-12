<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('fnb_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category', 50);
            $table->unsignedInteger('price');
            $table->json('packages')->nullable();
            $table->string('location')->nullable();
            $table->string('unit', 30)->default('porsi');
            $table->text('description')->nullable();
            $table->json('images')->nullable();
            $table->enum('status', ['available', 'habis'])->default('available');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('fnb_items'); }
};

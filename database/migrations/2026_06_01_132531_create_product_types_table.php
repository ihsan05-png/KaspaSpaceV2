<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('product_types', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('unit');
            $table->json('images')->nullable();
            $table->string('capacity', 50)->nullable();
            $table->string('amenity', 100)->nullable();
            $table->unsignedInteger('suggested_price')->default(0);
            $table->json('prices')->nullable();
            $table->string('location')->nullable();
            $table->string('badge', 50)->nullable();
            $table->boolean('no_room')->default(false);
            $table->boolean('requires_documents')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->enum('status', ['active', 'draft'])->default('active');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('product_types'); }
};

<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('location');
            $table->decimal('rating', 3, 1)->default(4.8);
            $table->unsignedInteger('reviews')->default(0);
            $table->unsignedInteger('price')->default(0);
            $table->string('unit', 20)->default('hari');
            $table->string('badge', 50)->nullable();
            $table->boolean('featured')->default(false);
            $table->string('capacity', 50)->nullable();
            $table->string('amenity', 100)->nullable();
            $table->enum('status', ['active', 'draft', 'archived'])->default('active');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('rooms'); }
};

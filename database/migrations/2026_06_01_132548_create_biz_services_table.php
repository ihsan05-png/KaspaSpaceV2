<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('biz_services', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category', 60)->default('Umum');
            $table->text('description')->nullable();
            $table->json('photos')->nullable();
            $table->unsignedInteger('price');
            $table->json('packages')->nullable();
            $table->string('location', 100)->nullable();
            $table->string('duration', 50)->nullable();
            $table->boolean('requires_documents')->default(false);
            $table->enum('status', ['active', 'draft'])->default('active');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('biz_services'); }
};

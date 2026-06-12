<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('discounts', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name', 100);
            $table->text('description')->nullable();
            $table->enum('type', ['percentage', 'fixed'])->default('percentage');
            $table->unsignedInteger('value');
            $table->unsignedInteger('min_order')->default(0);
            $table->unsignedInteger('max_discount')->nullable();
            $table->unsignedSmallInteger('quota')->nullable();
            $table->unsignedSmallInteger('used_count')->default(0);
            $table->date('valid_from')->nullable();
            $table->date('valid_until')->nullable();
            $table->json('applicable_to')->nullable(); // [{"cat":"coworking","id":"hot-desk","name":"Hot Desk"}]
            $table->json('user_ids')->nullable();       // null = semua user
            $table->string('color', 20)->default('#6366f1');
            $table->enum('status', ['active', 'draft'])->default('active');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('discounts'); }
};

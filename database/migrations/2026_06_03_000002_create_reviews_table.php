<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reviewable_type', 20);  // 'biz', 'product_type', 'fnb'
            $table->string('reviewable_key', 100);  // service id, product key, fnb id
            $table->unsignedTinyInteger('rating');   // 1–5
            $table->text('comment')->nullable();
            $table->string('reviewer_name', 100);
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();

            $table->unique(['user_id', 'reviewable_type', 'reviewable_key']);
            $table->index(['reviewable_type', 'reviewable_key', 'status']);
        });
    }
    public function down(): void { Schema::dropIfExists('reviews'); }
};

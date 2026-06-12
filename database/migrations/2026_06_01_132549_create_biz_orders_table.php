<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('biz_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('biz_service_id')->constrained()->cascadeOnDelete();
            $table->string('member_name', 100);
            $table->string('member_email', 150)->nullable();
            $table->string('member_phone', 30)->nullable();
            $table->string('package_name', 100)->nullable();
            $table->unsignedInteger('price');
            $table->string('discount_code', 30)->nullable();
            $table->unsignedInteger('discount_amount')->default(0);
            $table->enum('status', ['pending', 'proses', 'selesai', 'cancelled'])->default('pending');
            $table->text('note')->nullable();
            $table->json('documents')->nullable(); // [{name, url}]
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('biz_orders'); }
};

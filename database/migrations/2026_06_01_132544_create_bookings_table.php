<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('invoice_no', 30)->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guest_name', 100)->nullable();
            $table->string('guest_email', 150)->nullable();
            $table->string('guest_phone', 20)->nullable();
            $table->foreignId('room_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_type_key', 50);
            $table->date('booking_date');
            $table->date('end_date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->unsignedTinyInteger('qty_desks')->default(1);
            $table->foreignId('vo_package_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vo_bundle_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('total_price')->default(0);
            $table->unsignedInteger('admin_fee')->default(0);
            $table->unsignedInteger('deposit_paid')->default(0);
            $table->enum('status', ['pending', 'paid', 'checked-in', 'checked-out', 'cancelled'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->json('documents')->nullable();
            $table->timestamps();

            $table->index(['room_id', 'booking_date', 'status']);
            $table->index(['user_id', 'created_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('bookings'); }
};

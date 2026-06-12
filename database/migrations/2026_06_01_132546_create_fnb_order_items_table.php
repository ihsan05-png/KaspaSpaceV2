<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('fnb_order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fnb_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fnb_item_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // snapshot
            $table->unsignedSmallInteger('qty');
            $table->unsignedInteger('price');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('fnb_order_items'); }
};

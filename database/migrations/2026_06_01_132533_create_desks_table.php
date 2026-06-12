<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('desks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->string('number', 20);
            $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('desks'); }
};

<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('overtime_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->cascadeOnDelete();
            $table->tinyInteger('day_of_week'); // 0=Sun, 1=Mon ... 6=Sat
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->unique(['room_id', 'day_of_week']);
        });
    }
    public function down(): void { Schema::dropIfExists('overtime_schedules'); }
};

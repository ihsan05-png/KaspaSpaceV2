<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->string('slug', 120)->unique();
            $table->string('title');
            $table->text('excerpt');
            $table->json('body')->nullable();
            $table->string('category', 60)->default('Umum');
            $table->string('author_name', 100);
            $table->string('author_role', 80)->default('Kontributor');
            $table->string('image_url')->nullable();
            $table->string('read_time', 20)->default('3 min');
            $table->boolean('featured')->default(false);
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['status', 'published_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('articles'); }
};

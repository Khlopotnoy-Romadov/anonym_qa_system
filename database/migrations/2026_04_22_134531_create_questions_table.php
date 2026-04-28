<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('content');
            $table->string('image')->nullable();
            $table->boolean('is_answered')->default(false);
            $table->boolean('is_public')->default(true);
            $table->boolean('is_reported')->default(false);
            $table->timestamps();
            
            // Добавляем индексы для оптимизации запросов
            $table->index(['user_id', 'is_answered']);
            $table->index(['user_id', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
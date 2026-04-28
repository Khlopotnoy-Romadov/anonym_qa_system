<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            $table->string('reason');
            $table->string('reporter_ip');
            $table->timestamps();
            
            // Индекс для подсчета жалоб на вопрос
            $table->index('question_id');
            
            // Чтобы один IP не мог жаловаться много раз на один вопрос
            $table->unique(['question_id', 'reporter_ip']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
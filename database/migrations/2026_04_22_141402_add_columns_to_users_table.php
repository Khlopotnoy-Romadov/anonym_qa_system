<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Проверяем, существует ли таблица users
        if (Schema::hasTable('users')) {
            // Добавляем колонки, если их нет
            if (!Schema::hasColumn('users', 'username')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('username')->nullable();
                });
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('avatar')->nullable();
                });
            }
            if (!Schema::hasColumn('users', 'bio')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->text('bio')->nullable();
                });
            }
            if (!Schema::hasColumn('users', 'public_link')) {
                Schema::table('users', function (Blueprint $table) {
                    $table->string('public_link')->nullable();
                });
            }
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['username', 'avatar', 'bio', 'public_link'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};

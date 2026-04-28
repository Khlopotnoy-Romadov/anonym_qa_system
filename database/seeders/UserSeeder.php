<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Тестовый пользователь 1
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
            'username' => 'testuser',
            'public_link' => Str::random(8),
            'bio' => 'This is a test user account'
        ]);

        // Тестовый пользователь 2 (для примера)
        User::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => Hash::make('password123'),
            'username' => 'johndoe',
            'public_link' => Str::random(8),
            'bio' => 'Software developer and blogger'
        ]);

        // Тестовый пользователь 3
        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@example.com',
            'password' => Hash::make('password123'),
            'username' => 'janesmith',
            'public_link' => Str::random(8),
            'bio' => 'Fitness coach and nutritionist'
        ]);

        $this->command->info('Test users created successfully!');
        $this->command->info('Email: test@example.com, Password: password123');
    }
}

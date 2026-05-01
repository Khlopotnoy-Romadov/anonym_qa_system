cat > add_user.php << 'EOF'
#!/usr/bin/env php
<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

echo "=== Добавление пользователя ===\n";

// Параметры пользователя
$name = readline("Имя: ");
$email = readline("Email: ");
$username = readline("Username: ");
$password = readline("Пароль: ");

if (!$name || !$email || !$username || !$password) {
    die("Все поля обязательны!\n");
}

// Проверка на существование
if (User::where('email', $email)->exists()) {
    die("Пользователь с email {$email} уже существует!\n");
}

if (User::where('username', $username)->exists()) {
    die("Пользователь с username {$username} уже существует!\n");
}

// Создание пользователя
$user = User::create([
    'name' => $name,
    'email' => $email,
    'password' => Hash::make($password),
    'username' => $username,
    'public_link' => Str::random(8),
    'bio' => readline("Bio (опционально): ") ?: null
]);

echo "\n✅ Пользователь успешно создан!\n";
echo "ID: {$user->id}\n";
echo "Email: {$user->email}\n";
echo "Username: {$user->username}\n";
echo "Password: {$password}\n";
echo "Public Link: {$user->public_link}\n";

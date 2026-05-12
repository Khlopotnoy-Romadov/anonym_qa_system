#!/bin/bash
set -e

echo "🚀 Starting Q&A System initialization..."

# Ждем готовности MySQL
echo "⏳ Waiting for MySQL..."
until php -r "
try {
    \$pdo = new PDO('mysql:host=mysql;dbname=laravel', 'laravel', 'secret');
    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo 'connected';
} catch (PDOException \$e) {
    exit(1);
}
" 2>/dev/null; do
    echo "Waiting for MySQL connection..."
    sleep 2
done
echo "✅ MySQL is ready!"

cd /var/www

# Установка зависимостей Composer
if [ ! -d "vendor" ]; then
    echo "📦 Installing Composer dependencies..."
    composer install --no-interaction --optimize-autoloader
else
    echo "📦 Composer dependencies already installed"
fi

# Генерация APP_KEY если не задан
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
else
    echo "🔑 Application key exists"
fi

# Создание символической ссылки для storage
if [ ! -L "public/storage" ]; then
    echo "🔗 Creating storage symlink..."
    php artisan storage:link
else
    echo "🔗 Storage symlink exists"
fi

# Проверяем, есть ли уже таблицы в базе
echo "🔍 Checking database status..."
TABLE_COUNT=$(php -r "
try {
    \$pdo = new PDO('mysql:host=mysql;dbname=laravel', 'laravel', 'secret');
    \$stmt = \$pdo->query(\"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'laravel'\");
    echo \$stmt->fetchColumn();
} catch (PDOException \$e) {
    echo '0';
}
")

if [ "$TABLE_COUNT" -eq "0" ]; then
    echo "🗄️ Running fresh migrations..."
    php artisan migrate --force
    echo "✅ Migrations completed!"
else
    echo "🗄️ Database already has tables ($TABLE_COUNT tables found)"
    echo "🔍 Checking for pending migrations..."
    
    # Проверяем, есть ли непримененные миграции
    PENDING_MIGRATIONS=$(php artisan migrate:status | grep -c "Pending" || true)
    
    if [ "$PENDING_MIGRATIONS" -gt "0" ]; then
        echo "🔄 Running pending migrations..."
        php artisan migrate --force
        echo "✅ Pending migrations completed!"
    else
        echo "✅ All migrations are up to date"
    fi
fi

# Очистка кеша
echo "🧹 Clearing cache..."
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan route:clear

# Кеширование для production
if [ "$APP_ENV" = "production" ]; then
    echo "⚡ Optimizing for production..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Установка прав
echo "🔒 Setting permissions..."
chown -R www-data:www-data /var/www/storage
chown -R www-data:www-data /var/www/bootstrap/cache
chmod -R 775 /var/www/storage
chmod -R 775 /var/www/bootstrap/cache

echo "✨ Initialization complete! Starting services..."

# Запускаем supervisor
exec /usr/bin/supervisord -n -c /etc/supervisor/supervisord.conf
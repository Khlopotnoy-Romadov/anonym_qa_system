# Анонимная Q&A система

Система анонимных вопросов и ответов с AI-фильтрацией токсичного контента.

## Технологии

- **Backend**: Laravel 13, PHP 8.3, SQLite
- **Frontend**: Vue 3, Vuex, Vue Router, Vite
- **AI**: Python 3, HuggingFace Transformers, SkolkovoInstitute/russian_toxicity_classifier

## Установка

### 1. Клонировать проект
```bash
git clone https://github.com/yourname/anonym_qa_system.git
cd anonym_qa_system
```

### 2. Установить PHP-зависимости

 ```
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```
### 3. Установить Javascript-зависимости

```
npm install
npm run build
```

### 4. Установить Python ML модель для фильтрации токсичности
```
# Установить Python и venv
sudo apt install python3-pip python3-venv -y

# Создать виртуальное окружение
python3 -m venv venv
source venv/bin/activate

# Установить необходимые библиотеки
pip install transformers torch sentencepiece

# Проверить что модель работает
python3 python/check_toxicity.py 'Привет, как дела?'

# Деактивировать окружение
deactivate
```

### 5. Запуск сервера

```
# В одном терминале
npm run hot
# Во втором терминае
php artisan serve
```

Теперь можете открывать по локальному хосту:
http://localhost:8000
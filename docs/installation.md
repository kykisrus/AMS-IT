# Установка AMS-IT

## Системные требования

- Node.js 16.x или выше
- npm (входит в состав Node.js)
- MySQL 8.0 или выше
- Git

## Быстрая установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/kykisrus/AMS-IT.git
cd AMS-IT
```

2. Сделайте скрипт установки исполняемым:
```bash
sudo chmod +x install.sh
```

3. Запустите скрипт установки:
```bash
sudo ./install.sh
```

Скрипт автоматически выполнит:
- Проверку системных требований
- Настройку прав доступа
- Установку зависимостей бэкенда
- Установку зависимостей фронтенда
- Создание конфигурационного файла .env

## Ручная установка

Если вы предпочитаете установку вручную, выполните следующие шаги:

### 1. Настройка прав доступа

```bash
# Установка владельца файлов
sudo chown -R www-data:www-data .

# Установка прав на директории
find . -type d -exec chmod 755 {} \;

# Установка прав на файлы
find . -type f -exec chmod 644 {} \;

# Установка прав на скрипты
find . -type f -name "*.sh" -exec chmod +x {} \;
```

### 2. Установка зависимостей бэкенда

```bash
npm install
```

### 3. Установка зависимостей фронтенда

```bash
cd frontend
npm pkg set dependencies.typescript="^4.9.5"
npm pkg set dependencies.react="^18.2.0"
npm pkg set dependencies.react-dom="^18.2.0"
npm pkg set dependencies."@types/react"="^18.2.0"
npm pkg set dependencies."@types/react-dom"="^18.2.0"
npm install --legacy-peer-deps
cd ..
```

### 4. Настройка базы данных

1. Создайте базу данных MySQL:
```sql
CREATE DATABASE ams_it;
```

2. Создайте файл .env в корневой директории:
```env
# Настройки базы данных
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ams_it

# Настройки JWT
JWT_SECRET=your_jwt_secret_key

# Настройки почты
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password

# Настройки сервера
PORT=3001
```

## Запуск приложения

### Режим разработки

```bash
npm run dev:full
```

Это запустит:
- Бэкенд на порту 3001
- Фронтенд на порту 3000

### Продакшн режим

1. Сборка фронтенда:
```bash
cd frontend
npm run build
cd ..
```

2. Запуск сервера:
```bash
npm start
```

## Возможные проблемы

### Проблемы с правами доступа

Если возникают проблемы с правами доступа, выполните:
```bash
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
```

### Конфликты версий зависимостей

Если возникают конфликты версий при установке фронтенда, используйте:
```bash
cd frontend
npm install --legacy-peer-deps
```

### Проблемы с MySQL

Убедитесь, что:
- MySQL сервер запущен
- Пользователь имеет права на базу данных
- Параметры подключения в .env корректны 
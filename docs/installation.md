# Установка AMS IT System

## Требования к системе

### Backend
- Node.js 16.x или выше
- MySQL 8.0 или выше
- npm или yarn

### Frontend
- Node.js 16.x или выше
- npm или yarn

## Установка

### 1. Клонирование репозитория
```bash
git clone [url-репозитория]
cd ams-it-system
```

### 2. Настройка Backend

#### Установка зависимостей
```bash
cd backend
npm install
```

#### Настройка базы данных
1. Создайте базу данных MySQL:
```sql
CREATE DATABASE ams_it_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Импортируйте схему базы данных:
```bash
mysql -u [пользователь] -p ams_it_system < database/schema.mysql.sql
```

#### Настройка переменных окружения
Создайте файл `.env` в папке backend:
```env
PORT=3001
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ams_it_system
JWT_SECRET=your_jwt_secret
```

### 3. Настройка Frontend

#### Установка зависимостей
```bash
cd frontend
npm install
```

#### Настройка переменных окружения
Создайте файл `.env` в папке frontend:
```env
REACT_APP_API_URL=http://localhost:3001
```

## Запуск приложения

### Режим разработки

#### Запуск Backend
```bash
cd backend
npm run dev
```

#### Запуск Frontend
```bash
cd frontend
npm start
```

### Запуск всего приложения одной командой
```bash
npm run dev:full
```

## Первый запуск

1. Запустите приложение
2. Откройте http://localhost:3000
3. Нажмите "Регистрация" для создания первого пользователя (доступно только при пустой базе данных)
4. Войдите в систему с созданными учетными данными

## Проверка установки

1. Откройте http://localhost:3000
2. Войдите в систему
3. Проверьте доступность основных функций:
   - Просмотр списка техники
   - Добавление новой техники
   - Редактирование существующей техники
   - Удаление техники 
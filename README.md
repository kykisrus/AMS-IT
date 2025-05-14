![AMS-IT Logo](frontend/public/logo.png)

# AMS IT - Act Monitoring System for IT

Система мониторинга актов для ИТ-отдела — веб-платформа для управления ИТ-активами, автоматизации документооборота и отслеживания сервисных операций.

## Цель проекта

Оптимизация учёта техники, сокращение ручных процессов и повышение прозрачности работы ИТ-отделов.

## Ключевые возможности

* **Учёт и контроль ИТ-активов**
  * Управление техникой и инвентарными номерами
  * История перемещений и изменений
  * Отслеживание состояния оборудования

* **Документооборот**
  * Генерация актов приёма-передачи
  * Создание ремонтных заключений
  * Автоматическая нумерация документов
  * Электронная подпись документов

* **Интеграции**
  * Синхронизация с GLPI
  * Экспорт данных в различные форматы
  * API для внешних систем

* **Аналитика и отчётность**
  * Мониторинг затрат на ремонты
  * Статистика использования техники
  * Отчёты по движению активов

* **Уведомления**
  * Автоматические уведомления о событиях
  * Напоминания о сроках
  * Оповещения о статусах ремонтов

## Технологии

* **Backend**: Node.js, Express, MySQL
* **Frontend**: React, TypeScript, Material-UI
* **Аутентификация**: JWT
* **Безопасность**: bcryptjs
* **Документация**: Markdown

## Требования

* Node.js 16.x или выше
* MySQL 8.0 или выше
* npm

## Клонирование репозитория

```bash
git clone https://github.com/kykisrus/AMS-IT.git
cd AMS-IT
```

## Установка и запуск

### Автоматическая установка (рекомендуется)

Для автоматической установки используйте скрипт `install.sh`:

```bash
chmod +x install.sh
./install.sh
```

Скрипт выполнит:
- Проверку и настройку npm
- Проверку и запуск MySQL
- Создание базы данных и всех таблиц через `backend/database/setup.sql`
- Установку зависимостей backend и frontend
- Генерацию .env файла и JWT секрета
- Настройку прав доступа

После установки:
1. Перезапустите терминал или выполните `source ~/.bashrc`
2. Запустите приложение командой:
   ```bash
   npm run dev:full
   ```

### Ручная установка

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/kykisrus/AMS-IT.git
   cd AMS-IT
   ```

2. Установите зависимости:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   cd ..
   ```

3. Создайте базу данных и структуру таблиц вручную:
   - Запустите MySQL и выполните:
     ```bash
     mysql -u <user> -p < backend/database/setup.sql
     ```

4. Создайте файл `.env` в корне проекта и укажите параметры подключения к базе данных:
   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=ams_it
   JWT_SECRET=your_jwt_secret
   PORT=3001
   ```

5. Запустите backend:
   ```bash
   cd backend
   npm start
   ```

6. Запустите frontend:
   ```bash
   cd ../frontend
   npm start
   ```

## Структура проекта

```
AMS-IT/
├── frontend/           # React приложение
├── backend/            # Node.js сервер
│   └── database/       # setup.sql — структура БД
├── docs/               # Документация
└── install.sh          # Скрипт автоматической установки
```

## Роли пользователей

* **Супер-админ**: Полный доступ ко всем функциям
* **ИТ-специалист**: Управление техникой и актами
* **МОЛ**: Работа с актами приёма-передачи
* **Бухгалтер**: Просмотр финансовой информации
* **Комиссия по ремонту**: Управление ремонтами
* **Инвентаризационная комиссия**: Проведение инвентаризации

## Документация по структуре БД

Полная и актуальная структура базы данных, все связи, индексы и триггеры описаны в файле [`docs/DATABASE1.2.md`](docs/DATABASE1.2.md).

## Лицензия

GNUv3

## Контакты

* Автор: Кук Бахарев
* GitHub: [@kykisrus](https://github.com/kykisrus)

## Структура базы данных

### Таблица equipment
- id: INT PRIMARY KEY AUTO_INCREMENT
- inventory_number: VARCHAR(50) NOT NULL UNIQUE
- type: VARCHAR(100) NOT NULL
- model: VARCHAR(100) NOT NULL
- serial_number: VARCHAR(100)
- uuid: VARCHAR(100)
- manufacturer: VARCHAR(100)
- purchase_date: DATE
- purchase_cost: DECIMAL(10,2)
- depreciation_period: INT
- liquidation_value: DECIMAL(10,2)
- current_owner: INT
- current_status: ENUM('in_stock', 'in_use', 'in_repair', 'written_off', 'archived') DEFAULT 'in_stock'
- description: TEXT
- company_id: INT
- glpi_id: VARCHAR(100)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

## Дополнительная информация
- Для добавления новой техники используйте форму на фронтенде.
- Все поля формы соответствуют структуре таблицы equipment.

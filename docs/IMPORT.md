# Документация по системе импорта данных

## Оглавление
1. [Общее описание](#общее-описание)
2. [Структура базы данных](#структура-базы-данных)
3. [Поддерживаемые типы данных](#поддерживаемые-типы-данных)
4. [Процесс импорта](#процесс-импорта)
5. [Форматы файлов](#форматы-файлов)
6. [Обработка ошибок](#обработка-ошибок)
7. [API](#api)
8. [Примеры](#примеры)

## Общее описание

Система импорта данных предназначена для массовой загрузки информации в MySQL базу данных AMS-IT. 
Система поддерживает пошаговый процесс импорта с валидацией данных, предпросмотром и подробным логированием всех операций.

### Основные возможности
- Загрузка данных из CSV файлов
- Гибкое сопоставление полей
- Предпросмотр данных перед импортом
- Валидация данных
- Обработка дубликатов
- Подробное логирование
- История импортов

## Структура базы данных

### Таблица import_jobs
```sql
CREATE TABLE import_jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'failed') NOT NULL,
    total_rows INT DEFAULT 0,
    processed_rows INT DEFAULT 0,
    failed_rows INT DEFAULT 0,
    settings JSON,
    start_time DATETIME,
    end_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Таблица import_errors
```sql
CREATE TABLE import_errors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    row_number INT,
    row_data JSON,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Таблица import_mappings
```sql
CREATE TABLE import_mappings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    csv_column VARCHAR(100) NOT NULL,
    db_column VARCHAR(100) NOT NULL,
    transformation VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Поддерживаемые типы данных

### Сотрудники (employees)
| Поле БД | Тип MySQL | Обязательное | Описание |
|---------|-----------|--------------|-----------|
| full_name | VARCHAR(255) | да | ФИО |
| position | VARCHAR(100) | да | Должность |
| department | VARCHAR(100) | да | Отдел |
| company_id | INT | да | ID компании |
| phone | VARCHAR(20) | нет | Телефон |
| hire_date | DATE | да | Дата приема на работу |
| is_active | BOOLEAN | нет | Статус активности |

### Оборудование (equipment)
| Поле БД | Тип MySQL | Обязательное | Описание |
|---------|-----------|--------------|-----------|
| inventory_number | VARCHAR(50) | да | Инвентарный номер |
| type | VARCHAR(100) | да | Тип оборудования |
| serial_number | VARCHAR(100) | нет | Серийный номер |
| uuid | VARCHAR(36) | нет | UUID |
| model | VARCHAR(100) | да | Модель |
| manufacturer | VARCHAR(100) | да | Производитель |
| purchase_date | DATE | да | Дата покупки |
| purchase_cost | DECIMAL(10,2) | да | Стоимость покупки |
| depreciation_period | INT | нет | Период амортизации |
| liquidation_value | DECIMAL(10,2) | нет | Ликвидационная стоимость |
| current_status | ENUM | да | Статус |
| current_owner | INT | нет | ID владельца |
| description | TEXT | нет | Описание |
| company_id | INT | да | ID компании |

## Процесс импорта

### Шаг 1: Выбор типа импорта
- Выбор типа данных для импорта (employees/equipment)
- Загрузка соответствующего шаблона CSV
- Ознакомление с требованиями к данным

### Шаг 2: Загрузка файла
- Поддерживаемые форматы: CSV
- Максимальный размер файла: 10MB (настраивается в config/env.config.js)
- Требования к кодировке: UTF-8
- Обязательное наличие заголовков

### Шаг 3: Сопоставление полей
- Автоматическое определение заголовков
- Ручное сопоставление полей
- Валидация типов данных MySQL
- Проверка обязательных полей

### Шаг 4: Предпросмотр данных
- Отображение первых 10 строк
- Подсветка проблемных данных
- Статистика по типам данных
- Предварительная валидация

### Шаг 5: Настройки импорта
- Выбор обработки дубликатов:
  - skip: Пропускать существующие записи
  - update: Обновлять существующие записи
  - create_new: Создавать новые записи
- Настройка уровня валидации:
  - strict: Прерывать импорт при любой ошибке
  - soft: Пропускать ошибочные записи
- Размер пакетной обработки (batch size)

## API

### Endpoints

#### Валидация файла
```http
POST /api/import/validate
Content-Type: multipart/form-data

file: [CSV файл]
type: "employees" | "equipment"
```

Ответ:
```json
{
  "isValid": boolean,
  "errors": string[],
  "duplicates": {
    "count": number,
    "examples": string[]
  }
}
```

#### Предпросмотр данных
```http
POST /api/import/preview
Content-Type: application/json

{
  "jobId": "string",
  "mapping": {
    "csvColumn": "dbColumn"
  }
}
```

#### Запуск импорта
```http
POST /api/import/start
Content-Type: application/json

{
  "jobId": "string",
  "settings": {
    "duplicateHandling": "skip" | "update" | "create_new",
    "validationMode": "strict" | "soft",
    "batchSize": number
  }
}
```

## Примеры

### Пример успешного импорта сотрудников
```json
{
  "type": "employees",
  "mapping": {
    "ФИО": "full_name",
    "Должность": "position",
    "Отдел": "department",
    "Дата приема": "hire_date",
    "Компания": "company_id"
  },
  "settings": {
    "duplicateHandling": "skip",
    "validationMode": "strict",
    "batchSize": 100
  }
}
```

### SQL-запросы для работы с импортом

#### Получение статуса импорта
```sql
SELECT * FROM import_jobs WHERE id = ?;
```

#### Получение ошибок импорта
```sql
SELECT * FROM import_errors WHERE job_id = ?;
```

#### Получение маппинга полей
```sql
SELECT * FROM import_mappings WHERE job_id = ?;
``` 
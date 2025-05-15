# Полная структура базы данных (финальная версия)

---

## Быстрый старт: инициализация базы данных

Для автоматического создания всей структуры базы данных используйте файл [`backend/database/setup.sql`](../backend/database/setup.sql). Этот скрипт содержит все необходимые команды для создания таблиц, индексов и триггеров, полностью соответствующих данной документации.

**Применение:**
```bash
mysql -u <user> -p < backend/database/setup.sql
```

- Скрипт setup.sql используется при установке проекта через install.sh.
- В нем отражены только актуальные таблицы, поля, индексы и триггеры.
- Любые изменения в структуре БД должны вноситься как в setup.sql, так и в этот файл документации.

---

## Основные таблицы

### 1. Таблица `companies` (Организации)

| Поле         | Тип данных     | Описание                        | Ограничения                     |
|--------------|----------------|---------------------------------|----------------------------------|
| `id`         | INT            | Уникальный ID                   | PRIMARY KEY, AUTO_INCREMENT      |
| `name`       | VARCHAR(100)   | Название                        | UNIQUE, NOT NULL                 |
| `phone`      | VARCHAR(20)    | Контактный телефон              |                                  |
| `email`      | VARCHAR(100)   | Корпоративная почта             |                                  |
| `website`    | VARCHAR(100)   | Сайт                            |                                  |
| `logo_url`   | VARCHAR(255)   | Путь к логотипу                 |                                  |
| `mol_id`     | INT            | МОЛ (FK к `users.id`)           | `users.role = 'mol'`             |
| `created_at` | TIMESTAMP      | Дата создания                   | DEFAULT CURRENT_TIMESTAMP        |

### 2. Таблица `employees` (Сотрудники без доступа к системе)

| Поле         | Тип данных     | Описание                        | Ограничения                     |
|--------------|----------------|---------------------------------|----------------------------------|
| `id`         | INT            | Уникальный ID                   | PRIMARY KEY, AUTO_INCREMENT      |
| `full_name`  | VARCHAR(255)   | ФИО                             | NOT NULL                        |
| `position`   | VARCHAR(100)   | Должность                       | NOT NULL                        |
| `department` | VARCHAR(100)   | Отдел                           |                                 |
| `company_id` | INT            | Организация (FK к `companies`)  | NOT NULL                        |
| `manager_id` | INT            | Руководитель (FK к `employees`) | NULLABLE                        |
| `hire_date`  | DATE           | Дата приёма                     | NOT NULL                        |
| `is_active`  | BOOLEAN        | Статус активности               | DEFAULT 1                       |
| `created_at` | TIMESTAMP      | Дата создания                   | DEFAULT CURRENT_TIMESTAMP        |

### 3. Таблица `users` (Пользователи системы)

| Поле          | Тип данных     | Описание                        | Ограничения                     |
|---------------|----------------|---------------------------------|----------------------------------|
| `id`          | INT            | Уникальный ID                   | PRIMARY KEY, AUTO_INCREMENT      |
| `username`    | VARCHAR(50)    | Логин                           | UNIQUE, NOT NULL                |
| `password_hash`| VARCHAR(255)  | Хеш пароля                      | NOT NULL                        |
| `email`       | VARCHAR(100)   | Почта                           | UNIQUE                          |
| `full_name`   | VARCHAR(255)   | ФИО                             | NOT NULL                        |
| `role`        | ENUM('super_admin', 'it', 'accountant', 'repair_commission', 'mol') | Роль | NOT NULL |
| `employee_id` | INT            | Связь с сотрудником (опционально)| FK (`employees.id`), NULLABLE   |
| `last_login`  | TIMESTAMP      | Последний вход                  | NULLABLE                        |
| `created_at`  | TIMESTAMP      | Дата создания                   | DEFAULT CURRENT_TIMESTAMP        |

### 4. Таблица `equipment` (Оборудование)

| Поле               | Тип данных     | Описание                        | Ограничения                     |
|--------------------|----------------|---------------------------------|----------------------------------|
| `id`               | INT            | Уникальный ID                   | PRIMARY KEY, AUTO_INCREMENT      |
| `inventory_number` | VARCHAR(50)    | Инвентарный номер               | UNIQUE                          |
| `type`             | VARCHAR(100)   | Тип (ноутбук, принтер и т.д.)   | NOT NULL                        |
| `model`            | VARCHAR(100)   | Модель                          |                                 |
| `serial_number`    | VARCHAR(100)   | Серийный номер                  |                                 |
| `uuid`             | VARCHAR(36)    | Уникальный идентификатор        |                                 |
| `manufacturer`     | VARCHAR(100)   | Производитель                   |                                 |
| `purchase_date`    | DATE           | Дата покупки                    | NOT NULL                        |
| `purchase_cost`    | DECIMAL(10,2)  | Стоимость без НДС               | CHECK (purchase_cost >= 0)      |
| `depreciation_period`| INT          | Период амортизации (месяцы)     | CHECK (depreciation_period >= 0)|
| `liquidation_value`| DECIMAL(10,2)  | Ликвидационная стоимость        | CHECK (liquidation_value >= 0)  |
| `current_status`   | ENUM('in_stock', 'in_use', 'in_repair', 'written_off', 'archived') | Статус | NOT NULL |
| `current_owner`    | INT            | Владелец (FK к `employees.id`)  | NULLABLE                        |
| `description`      | TEXT           | Описание                        |                                 |
| `company_id`       | INT            | Организация (FK к `companies.id`) | NOT NULL                      |
| `glpi_id`          | VARCHAR(50)    | ID в GLPI (опционально)         |                                 |

### 5. Таблица `transfer_acts` (Акты передачи)

| Поле             | Тип данных     | Описание                        | Ограничения                     |
|------------------|----------------|---------------------------------|----------------------------------|
| `id`             | INT            | Уникальный ID                   | PRIMARY KEY, AUTO_INCREMENT      |
| `act_number`     | VARCHAR(50)    | Номер акта                      | UNIQUE                          |
| `type`           | ENUM('receipt', 'issue') | Тип акта                    | NOT NULL                        |
| `equipment_id`   | INT            | Оборудование (FK к `equipment.id`) | NULLABLE                     |
| `from_user_id`   | INT            | Сотрудник-сдатчик (FK к `employees.id`) | NULLABLE                |
| `to_user_id`     | INT            | Сотрудник-получатель (FK к `employees.id`) | NULLABLE             |
| `company_id`     | INT            | Организация (FK к `companies.id`) | NOT NULL                      |
| `status`         | ENUM('draft', 'signed', 'completed') | Статус | NOT NULL             |
| `scan_path`      | VARCHAR(255)   | Путь к скану акта               |                                 |
| `created_by`     | INT            | Создатель (FK к `users.id`)     | NOT NULL                        |
| `confirmed_by`   | INT            | Подтвердивший (FK к `users.id`) | NULLABLE                        |
| `created_at`     | TIMESTAMP      | Дата создания                   | DEFAULT CURRENT_TIMESTAMP        |
| `updated_at`     | TIMESTAMP      | Дата обновления                 | ON UPDATE CURRENT_TIMESTAMP      |

### 6. Таблица `transfer_act_equipment` (Связь актов с оборудованием)

| Поле             | Тип данных     | Описание                        | Ограничения                     |
|------------------|----------------|---------------------------------|----------------------------------|
| `transfer_act_id`| INT            | ID акта (FK к `transfer_acts.id`) | NOT NULL                      |
| `equipment_id`   | INT            | ID оборудования (FK к `equipment.id`) | NOT NULL                  |
| `order_number`   | INT            | Порядковый номер в акте         | CHECK (order_number > 0)         |

### 7. Таблица `repair_acts` (Акты ремонта)

| Поле                 | Тип данных     | Описание                        | Ограничения                     |
|----------------------|----------------|---------------------------------|----------------------------------|
| `id`                 | INT            | Уникальный ID                   | PRIMARY KEY, AUTO_INCREMENT      |
| `act_number`         | VARCHAR(50)    | Номер акта                      | UNIQUE                          |
| `equipment_id`       | INT            | ID оборудования (FK к `equipment.id`) | NOT NULL                  |
| `liquidation_value`  | DECIMAL(10,2)  | Ликвидационная стоимость        | CHECK (liquidation_value >= 0)  |
| `failure_reason`     | TEXT           | Причина неисправности           |                                 |
| `commission_conclusion`| TEXT         | Заключение комиссии             |                                 |

### 8. Таблица `repair_commission_members` (Состав комиссии)

| Поле             | Тип данных     | Описание                        | Ограничения                     |
|------------------|----------------|---------------------------------|----------------------------------|
| `repair_act_id`  | INT            | ID акта ремонта (FK к `repair_acts.id`) | NOT NULL                |
| `user_id`        | INT            | ID члена комиссии (FK к `users.id`) | NOT NULL                    |

### 12. Таблица `roles` (Управление ролями пользователей)

| Поле         | Тип данных     | Описание                        | Ограничения                     |
|--------------|----------------|---------------------------------|----------------------------------|
| `id`         | INT            | Уникальный ID                   | PRIMARY KEY, AUTO_INCREMENT      |
| `name`       | VARCHAR(50)    | Название роли                   | UNIQUE, NOT NULL                 |
| `description`| VARCHAR(255)   | Описание роли                   |                                  |
| `permissions`| TEXT           | JSON-массив разрешений          |                                  |
| `is_manager` | BOOLEAN        | Может быть руководителем        | DEFAULT 0                        |

#### Список ролей по умолчанию:
- `super_admin` — Супер-администратор
- `it` — IT специалист
- `accountant` — Бухгалтер
- `repair_commission` — Ремонтная комиссия
- `mol` — Материально-ответственное лицо

> **is_manager** — если выставлен, пользователи с этой ролью могут быть выбраны как руководители в системе.

Связи
Таблица companies:
mol_id → users.id (пользователь с ролью 'mol')
Таблица employees:
company_id → companies.id
manager_id → employees.id (самореферентная связь)
Таблица users:
employee_id → employees.id (опционально)
Таблица equipment:
current_owner → employees.id
company_id → companies.id
Таблица transfer_acts:
equipment_id → equipment.id
from_user_id → employees.id
to_user_id → employees.id
company_id → companies.id
created_by → users.id
confirmed_by → users.id
Таблица transfer_act_equipment:
transfer_act_id → transfer_acts.id
equipment_id → equipment.id
Таблица repair_acts:
equipment_id → equipment.id
Таблица repair_commission_members:
repair_act_id → repair_acts.id
user_id → users.id
Индексы
Таблица companies:
idx_companies_name (поиск по названию)
idx_companies_mol_id (связь с пользователем-МОЛ)
Таблица employees:
idx_employees_company (фильтрация по организации)
idx_employees_manager (поиск по руководителю)
Таблица equipment:
idx_equipment_owner (поиск по владельцу)
idx_equipment_status (фильтрация по статусу)
idx_equipment_inventory_number (поиск по инвентарному номеру)
Таблица transfer_acts:
(нет дополнительных индексов, но можно рассмотреть индекс по act_number для поиска)
Таблица transfer_act_equipment:
Составной первичный ключ: (transfer_act_id, equipment_id)
Таблица repair_acts:
(нет дополнительных индексов, но можно рассмотреть индекс по equipment_id)
Таблица repair_commission_members:
(нет дополнительных индексов)
Триггеры
Таблица companies:
sql

DELIMITER //
CREATE TRIGGER check_mol_role 
BEFORE INSERT ON companies
FOR EACH ROW
BEGIN
  IF (SELECT role FROM users WHERE id = NEW.mol_id) != 'mol' THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Указанный пользователь не является МОЛ';
  END IF;
END;
//
DELIMITER ;
Таблица users:
sql

DELIMITER //
CREATE TRIGGER check_employee_active 
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
  IF NEW.employee_id IS NOT NULL AND 
    (SELECT is_active FROM employees WHERE id = NEW.employee_id) = 0 THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Сотрудник неактивен';
  END IF;
END;
//
DELIMITER ;
Таблица transfer_acts:
sql

DELIMITER //
CREATE TRIGGER check_same_company 
BEFORE INSERT ON transfer_acts
FOR EACH ROW
BEGIN
  DECLARE from_company INT;
  DECLARE to_company INT;
  SET from_company = (SELECT company_id FROM employees WHERE id = NEW.from_user_id);
  SET to_company = (SELECT company_id FROM employees WHERE id = NEW.to_user_id);
  IF from_company IS NOT NULL AND to_company IS NOT NULL AND from_company != to_company THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Сотрудники должны быть из одной организации';
  END IF;
END;
//
DELIMITER ;

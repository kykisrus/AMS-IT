-- Создаем временные колонки для хранения новых данных
ALTER TABLE employees 
  ADD COLUMN temp_last_name VARCHAR(100) NULL,
  ADD COLUMN temp_first_name VARCHAR(100) NULL,
  ADD COLUMN temp_middle_name VARCHAR(100) NULL;

-- Заполняем временные колонки данными из full_name
UPDATE employees 
SET 
  temp_last_name = SUBSTRING_INDEX(full_name, ' ', 1),
  temp_first_name = CASE 
    WHEN LENGTH(full_name) - LENGTH(REPLACE(full_name, ' ', '')) >= 1 
    THEN SUBSTRING_INDEX(SUBSTRING_INDEX(full_name, ' ', 2), ' ', -1)
    ELSE NULL 
  END,
  temp_middle_name = CASE 
    WHEN LENGTH(full_name) - LENGTH(REPLACE(full_name, ' ', '')) = 2 
    THEN SUBSTRING_INDEX(full_name, ' ', -1)
    ELSE NULL 
  END;

-- Добавляем новые колонки
ALTER TABLE employees 
  ADD COLUMN phone VARCHAR(20) AFTER manager_id,
  ADD COLUMN glpi_id VARCHAR(50) AFTER phone,
  ADD COLUMN bitrix_id VARCHAR(50) AFTER glpi_id;

-- Делаем временные колонки NOT NULL где необходимо
UPDATE employees SET temp_first_name = 'Неизвестно' WHERE temp_first_name IS NULL;
UPDATE employees SET temp_last_name = 'Неизвестно' WHERE temp_last_name IS NULL;

-- Переименовываем колонки
ALTER TABLE employees 
  DROP COLUMN full_name,
  CHANGE COLUMN temp_last_name last_name VARCHAR(100) NOT NULL,
  CHANGE COLUMN temp_first_name first_name VARCHAR(100) NOT NULL,
  CHANGE COLUMN temp_middle_name middle_name VARCHAR(100) NULL; 
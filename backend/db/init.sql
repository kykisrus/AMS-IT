-- Таблица ролей
CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  permissions JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Добавляем внешний ключ в таблицу users
ALTER TABLE users
ADD CONSTRAINT fk_user_role
FOREIGN KEY (role) REFERENCES roles(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Добавляем базовые роли
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Администратор системы', '["users.view", "users.create", "users.edit", "users.delete", "roles.view", "roles.create", "roles.edit", "roles.delete"]'),
('office_manager', 'Руководитель в офисе', '["users.view", "users.create", "users.edit"]'),
('employee', 'Сотрудник', '["users.view"]');

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Добавляем колонку login, если она еще не существует
ALTER TABLE users
ADD COLUMN IF NOT EXISTS login VARCHAR(50) UNIQUE AFTER email;

-- Добавляем пользователя с логином 'It' и паролем 'it'
INSERT INTO users (username, password_hash, email, full_name, role) VALUES ('It', '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890', 'it@example.com', 'IT User', 'admin');

-- Обновляем почту и роль пользователя 'It'
UPDATE users SET email = 'it@it.it', role = 'super_admin' WHERE username = 'It';

-- Обновляем пароль пользователя 'it' на корректный хеш для 'it' с использованием bcrypt
UPDATE users SET password_hash = '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890' WHERE username = 'it';

-- Обновляем логин пользователя 'It' на 'it' (с маленькой буквы)
UPDATE users SET username = 'it' WHERE username = 'It';

-- Выводим пользователя admin из базы данных
SELECT * FROM users WHERE username = 'admin'; 
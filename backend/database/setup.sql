-- AMS-IT: Полная структура базы данных (актуальная версия)
CREATE DATABASE IF NOT EXISTS ams_it CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ams_it;

-- 1. Таблица companies
CREATE TABLE IF NOT EXISTS companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  email VARCHAR(100),
  website VARCHAR(100),
  logo_url VARCHAR(255),
  mol_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mol_id) REFERENCES users(id)
);

-- 2. Таблица employees
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  position VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  company_id INT NOT NULL,
  manager_id INT,
  hire_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- 3. Таблица users
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'it', 'accountant', 'repair_commission', 'mol') NOT NULL,
  employee_id INT,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- 4. Таблица equipment
CREATE TABLE IF NOT EXISTS equipment (
  id INT PRIMARY KEY AUTO_INCREMENT,
  inventory_number VARCHAR(50) NOT NULL UNIQUE,
  type VARCHAR(100) NOT NULL,
  model VARCHAR(100),
  serial_number VARCHAR(100),
  uuid VARCHAR(36),
  manufacturer VARCHAR(100),
  purchase_date DATE NOT NULL,
  purchase_cost DECIMAL(10,2) CHECK (purchase_cost >= 0),
  depreciation_period INT CHECK (depreciation_period >= 0),
  liquidation_value DECIMAL(10,2) CHECK (liquidation_value >= 0),
  current_status ENUM('in_stock', 'in_use', 'in_repair', 'written_off', 'archived') NOT NULL,
  current_owner INT,
  description TEXT,
  company_id INT NOT NULL,
  glpi_id VARCHAR(50),
  FOREIGN KEY (current_owner) REFERENCES employees(id),
  FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- 5. Таблица transfer_acts
CREATE TABLE IF NOT EXISTS transfer_acts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  act_number VARCHAR(50) NOT NULL UNIQUE,
  type ENUM('receipt', 'issue') NOT NULL,
  equipment_id INT,
  from_user_id INT,
  to_user_id INT,
  company_id INT NOT NULL,
  status ENUM('draft', 'signed', 'completed') NOT NULL,
  scan_path VARCHAR(255),
  created_by INT NOT NULL,
  confirmed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (from_user_id) REFERENCES employees(id),
  FOREIGN KEY (to_user_id) REFERENCES employees(id),
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (confirmed_by) REFERENCES users(id)
);

-- 6. Таблица transfer_act_equipment
CREATE TABLE IF NOT EXISTS transfer_act_equipment (
  transfer_act_id INT NOT NULL,
  equipment_id INT NOT NULL,
  order_number INT CHECK (order_number > 0),
  PRIMARY KEY (transfer_act_id, equipment_id),
  FOREIGN KEY (transfer_act_id) REFERENCES transfer_acts(id),
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- 7. Таблица repair_acts
CREATE TABLE IF NOT EXISTS repair_acts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  act_number VARCHAR(50) NOT NULL UNIQUE,
  equipment_id INT NOT NULL,
  liquidation_value DECIMAL(10,2) CHECK (liquidation_value >= 0),
  failure_reason TEXT,
  commission_conclusion TEXT,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- 8. Таблица repair_commission_members
CREATE TABLE IF NOT EXISTS repair_commission_members (
  repair_act_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (repair_act_id, user_id),
  FOREIGN KEY (repair_act_id) REFERENCES repair_acts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Индексы
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_mol_id ON companies(mol_id);
CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_equipment_owner ON equipment(current_owner);
CREATE INDEX idx_equipment_status ON equipment(current_status);
CREATE INDEX idx_equipment_inventory_number ON equipment(inventory_number);

-- Триггеры
DELIMITER //
CREATE TRIGGER check_mol_role 
BEFORE INSERT ON companies
FOR EACH ROW
BEGIN
  IF (SELECT role FROM users WHERE id = NEW.mol_id) != 'mol' THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Указанный пользователь не является МОЛ';
  END IF;
END;//
DELIMITER ;

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
END;//
DELIMITER ;

DELIMITER //
CREATE TRIGGER check_same_company 
BEFORE INSERT ON transfer_acts
FOR EACH ROW
BEGIN
  DECLARE from_company INT;
  DECLARE to_company INT;
  SET from_company = (SELECT company_id FROM employees WHERE id = NEW.from_user_id);
  SET to_company = (SELECT company_id FROM employees WHERE id = NEW.to_user_id);
  IF from_company != to_company THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Сотрудники должны быть из одной организации';
  END IF;
END;//
DELIMITER ; 
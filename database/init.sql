-- Создание базы данных
CREATE DATABASE IF NOT EXISTS ams_it;
USE ams_it;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role ENUM('super_admin', 'it_specialist', 'mol', 'accountant', 'repair_commission', 'inventory_commission') NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица техники
CREATE TABLE IF NOT EXISTS equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    inventory_number VARCHAR(50) UNIQUE NOT NULL,
    serial_number VARCHAR(100),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    status ENUM('active', 'repair', 'written_off', 'lost') NOT NULL DEFAULT 'active',
    cost DECIMAL(10,2) NOT NULL,
    purchase_date DATE,
    warranty_end_date DATE,
    location VARCHAR(100),
    responsible_person_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (responsible_person_id) REFERENCES users(id)
);

-- Таблица актов
CREATE TABLE IF NOT EXISTS acts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    number VARCHAR(50) UNIQUE NOT NULL,
    type ENUM('inventory', 'repair', 'write_off') NOT NULL,
    status ENUM('draft', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'draft',
    date DATE NOT NULL,
    created_by INT NOT NULL,
    approved_by INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- Таблица связи актов и техники
CREATE TABLE IF NOT EXISTS act_equipment (
    act_id INT NOT NULL,
    equipment_id INT NOT NULL,
    condition_before TEXT,
    condition_after TEXT,
    repair_cost DECIMAL(10,2),
    repair_description TEXT,
    PRIMARY KEY (act_id, equipment_id),
    FOREIGN KEY (act_id) REFERENCES acts(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Таблица истории перемещений
CREATE TABLE IF NOT EXISTS equipment_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    from_location VARCHAR(100),
    to_location VARCHAR(100),
    from_user_id INT,
    to_user_id INT,
    act_id INT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (act_id) REFERENCES acts(id)
);

-- Таблица ремонтов
CREATE TABLE IF NOT EXISTS repairs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_id INT NOT NULL,
    act_id INT NOT NULL,
    repair_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL,
    start_date DATE,
    end_date DATE,
    repair_company VARCHAR(100),
    warranty_period INT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (act_id) REFERENCES acts(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Таблица уведомлений
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(50),
    related_entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица настроек системы
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    key VARCHAR(50) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Таблица логов действий
CREATE TABLE IF NOT EXISTS activity_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Создание индексов
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_acts_status ON acts(status);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_equipment_movements_equipment ON equipment_movements(equipment_id);

-- Вставка базовых настроек
INSERT INTO settings (key, value, description) VALUES
('system_name', 'AMS IT', 'Название системы'),
('company_name', 'ООО "Компания"', 'Название компании'),
('notification_email', 'admin@company.com', 'Email для уведомлений'),
('warranty_period', '12', 'Стандартный гарантийный период (месяцев)'),
('repair_commission_threshold', '10000', 'Порог стоимости ремонта для комиссии (руб.)'); 
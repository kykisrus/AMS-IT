-- Создание таблицы пользователей
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'it_specialist', 'mol', 'accountant', 'repair_commission', 'inventory_commission')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы компаний
CREATE TABLE companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mol_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (mol_id) REFERENCES users(id)
);

-- Создание таблицы оборудования
CREATE TABLE equipment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_number VARCHAR(50) UNIQUE NOT NULL,
    serial_number VARCHAR(100),
    uuid VARCHAR(100),
    model VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    depreciation_period INT, -- в месяцах
    liquidation_value DECIMAL(10,2),
    current_status VARCHAR(50) NOT NULL,
    current_owner_id INT,
    company_id INT,
    glpi_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (current_owner_id) REFERENCES users(id),
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Создание таблицы актов передачи
CREATE TABLE transfer_acts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    act_number VARCHAR(50) UNIQUE NOT NULL,
    equipment_id INT,
    from_user_id INT,
    to_user_id INT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('created', 'confirmed', 'archived')),
    scan_path VARCHAR(255),
    created_by INT,
    confirmed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (confirmed_by) REFERENCES users(id)
);

-- Создание таблицы ремонтов
CREATE TABLE repairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    equipment_id INT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('in_repair', 'waiting_conclusion', 'sent_for_repair')),
    repair_cost DECIMAL(10,2),
    description TEXT,
    conclusion_path VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Создание таблицы уведомлений
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Создание таблицы шаблонов документов
CREATE TABLE document_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    required_fields JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Индексы
CREATE INDEX idx_equipment_inventory_number ON equipment(inventory_number);
CREATE INDEX idx_equipment_glpi_id ON equipment(glpi_id);
CREATE INDEX idx_transfer_acts_status ON transfer_acts(status);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id); 
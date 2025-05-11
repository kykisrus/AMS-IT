-- Создание таблицы пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'it_specialist', 'mol', 'accountant', 'repair_commission', 'inventory_commission')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы компаний
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mol_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы оборудования
CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    inventory_number VARCHAR(50) UNIQUE NOT NULL,
    serial_number VARCHAR(100),
    uuid VARCHAR(100),
    model VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    purchase_date DATE,
    purchase_cost DECIMAL(10,2),
    depreciation_period INTEGER, -- в месяцах
    liquidation_value DECIMAL(10,2),
    current_status VARCHAR(50) NOT NULL,
    current_owner_id INTEGER REFERENCES users(id),
    company_id INTEGER REFERENCES companies(id),
    glpi_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы актов передачи
CREATE TABLE transfer_acts (
    id SERIAL PRIMARY KEY,
    act_number VARCHAR(50) UNIQUE NOT NULL,
    equipment_id INTEGER REFERENCES equipment(id),
    from_user_id INTEGER REFERENCES users(id),
    to_user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('created', 'confirmed', 'archived')),
    scan_path VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    confirmed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы ремонтов
CREATE TABLE repairs (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER REFERENCES equipment(id),
    status VARCHAR(50) NOT NULL CHECK (status IN ('in_repair', 'waiting_conclusion', 'sent_for_repair')),
    repair_cost DECIMAL(10,2),
    description TEXT,
    conclusion_path VARCHAR(255),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы уведомлений
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы шаблонов документов
CREATE TABLE document_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    required_fields JSONB,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_equipment_inventory_number ON equipment(inventory_number);
CREATE INDEX idx_equipment_glpi_id ON equipment(glpi_id);
CREATE INDEX idx_transfer_acts_status ON transfer_acts(status);
CREATE INDEX idx_repairs_status ON repairs(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id); 
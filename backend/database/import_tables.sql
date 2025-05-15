-- Таблица для хранения заданий импорта
CREATE TABLE IF NOT EXISTS import_jobs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'failed') NOT NULL,
    total_rows INT DEFAULT 0,
    processed_rows INT DEFAULT 0,
    failed_rows INT DEFAULT 0,
    settings LONGTEXT,
    start_time DATETIME,
    end_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица для хранения ошибок импорта
CREATE TABLE IF NOT EXISTS import_errors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    line_number INT,
    row_data LONGTEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица для хранения маппинга полей
CREATE TABLE IF NOT EXISTS import_mappings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    job_id INT NOT NULL,
    csv_column VARCHAR(100) NOT NULL,
    db_column VARCHAR(100) NOT NULL,
    transformation VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Индексы для оптимизации запросов
CREATE INDEX idx_import_jobs_type ON import_jobs(type);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_errors_job_id ON import_errors(job_id);
CREATE INDEX idx_import_mappings_job_id ON import_mappings(job_id); 
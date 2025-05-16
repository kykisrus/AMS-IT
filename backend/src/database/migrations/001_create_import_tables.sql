-- Создание таблицы для хранения загруженных файлов
CREATE TABLE IF NOT EXISTS import_files (
  id VARCHAR(36) PRIMARY KEY,
  original_name VARCHAR(255) NOT NULL,
  path VARCHAR(255) NOT NULL,
  size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Создание таблицы для хранения задач импорта
CREATE TABLE IF NOT EXISTS import_jobs (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('employees', 'departments', 'positions', 'documents') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL,
  progress INT DEFAULT 0,
  total_records INT DEFAULT 0,
  processed_records INT DEFAULT 0,
  errors JSON,
  settings JSON,
  file_id VARCHAR(36),
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (file_id) REFERENCES import_files(id) ON DELETE SET NULL
);

-- Создание индексов
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_type ON import_jobs(type);
CREATE INDEX idx_import_jobs_created_at ON import_jobs(created_at); 
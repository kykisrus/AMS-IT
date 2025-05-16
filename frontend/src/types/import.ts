// Типы импорта
export type ImportType = 'employees' | 'equipment';

export type ImportStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'completed_with_errors';

export type ValidationMode = 'strict' | 'soft';

export type DuplicateHandling = 'skip' | 'update' | 'create_new';

export type LogLevel = 'basic' | 'detailed';

// Интерфейсы
export interface ImportSettings {
  duplicateHandling: DuplicateHandling;
  validationMode: ValidationMode;
  logLevel: LogLevel;
  batchSize: number;
  skipEmptyValues: boolean;
  notifyOnComplete: boolean;
}

export interface ImportJob {
  id: string;
  type: ImportType;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: ImportError[];
  settings: ImportSettings;
  fileId: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ImportError {
  message: string;
  row: number;
  column: string;
}

export interface ImportPreview {
  fileId: string;
  totalRows: number;
  headers: string[];
  rows: Record<string, any>[];
  errors: ImportError[];
}

export interface ImportResult {
  id: string;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  error?: string;
}

export interface ColumnMapping {
  csvHeader: string;
  dbField: string;
  required: boolean;
  type: string;
}

export interface DbColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimary: boolean;
  isUnique: boolean;
  defaultValue?: string;
  description?: string;
  required?: boolean;
  label?: string;
}

// Константы для отображения
export const IMPORT_TYPES: Record<ImportType, string> = {
  employees: 'Сотрудники',
  equipment: 'Техника'
};

export const IMPORT_STATUSES: Record<ImportStatus, string> = {
  pending: 'Ожидает',
  in_progress: 'В процессе',
  completed: 'Завершен',
  failed: 'Ошибка',
  cancelled: 'Отменен',
  completed_with_errors: 'Завершен с ошибками'
};

export const VALIDATION_MODES: Record<ValidationMode, string> = {
  strict: 'Строгий',
  soft: 'Мягкий'
};

export const DUPLICATE_HANDLING: Record<DuplicateHandling, string> = {
  skip: 'Пропустить',
  update: 'Обновить',
  create_new: 'Создать новый'
};

export const LOG_LEVELS: Record<LogLevel, string> = {
  basic: 'Базовый',
  detailed: 'Детальный'
}; 
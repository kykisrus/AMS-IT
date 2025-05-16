import { Document, Types } from 'mongoose';

export type ImportType = 'employees' | 'departments' | 'positions' | 'documents';

export enum ImportStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type DuplicateHandling = 'skip' | 'update' | 'error';
export type ValidationMode = 'strict' | 'warn' | 'skip';
export type LogLevel = 'basic' | 'detailed' | 'debug';

export interface ImportSettings {
  duplicateHandling: DuplicateHandling;
  validationMode: ValidationMode;
  logLevel: LogLevel;
  batchSize: number;
  skipEmptyValues: boolean;
  notifyOnComplete: boolean;
}

export interface ImportConfig {
  type: ImportType;
  validationMode: ValidationMode;
  skipDuplicates: boolean;
  updateExisting: boolean;
  batchSize: number;
}

export interface ColumnMapping {
  csvHeader: string;
  dbField: string;
  required: boolean;
  validator?: (value: string) => boolean | string;
}

export interface ImportError {
  row: number;
  column: string;
  message: string;
  value?: string;
}

export interface ImportDocument extends Document {
  _id: string;
  status: ImportStatus;
  type: ImportType;
  filename: string;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  settings: ImportSettings;
  columnMapping: ColumnMapping[];
  importErrors: ImportError[];
  createdAt: Date;
  updatedAt: Date;
  
  // Методы
  updateProgress(processedRows: number, failedRows: number): Promise<void>;
  addError(row: number, message: string): Promise<void>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    column: string;
    message: string;
    value?: string;
    code?: string;
    field?: string;
    details?: Record<string, unknown>;
  }>;
  warnings?: Array<{
    row: number;
    column: string;
    message: string;
  }>;
  metadata?: {
    totalValidated: number;
    startTime: Date;
    endTime: Date;
    duration: number;
  };
}

export interface ImportProgress {
  status: ImportStatus;
  processedRows: number;
  totalRows: number;
  failedRows: number;
  currentOperation?: string;
}

export interface PreviewData {
  headers: string[];
  rows: Array<Record<string, string>>;
  validationErrors: Array<{
    row: number;
    column: string;
    value: string;
    message: string;
  }>;
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicates: number;
  };
}

// Схемы валидации для разных типов импорта
export interface EmployeeImportSchema {
  last_name: string;
  first_name: string;
  middle_name?: string;
  position: string;
  department: string;
  company_id: number;
  phone?: string;
  glpi_id?: string;
  bitrix_id?: string;
  hire_date: Date;
}

export interface EquipmentImportSchema {
  inventory_number: string;
  type: string;
  serial_number?: string;
  uuid?: string;
  model: string;
  manufacturer: string;
  purchase_date: Date;
  purchase_cost: number;
  depreciation_period?: number;
  liquidation_value?: number;
  current_status: string;
  current_owner?: number;
  description?: string;
  company_id: number;
  glpi_id?: string;
}

export interface CompanyImportSchema {
  name: string;
  legal_name: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  contact_person?: string;
  parent_company_id?: number;
}

// Конфигурация колонок для каждого типа импорта
export interface ColumnConfig {
  name: string;
  label: string;
  required: boolean;
  type: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    allowedValues?: string[];
  };
}

export interface ImportTypeConfig {
  columns: ColumnConfig[];
  validators: ((value: any) => ValidationResult | null)[];
  transformers: ((value: any) => any)[];
}

export interface ImportJob {
  id: string;
  type: ImportType;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  totalRecords: number;
  processedRecords: number;
  errors: ImportError[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  fileId?: string;
}

export interface ImportPreview {
  headers: string[];
  rows: Record<string, any>[];
  errors: ImportError[];
  totalRows: number;
  fileId: string;
} 
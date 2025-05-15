export enum ImportType {
  EMPLOYEES = 'employees',
  EQUIPMENT = 'equipment',
  COMPANIES = 'companies'
}

export enum ImportStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum ValidationMode {
  STRICT = 'strict',
  LENIENT = 'lenient'
}

export type DuplicateHandling = 'skip' | 'update' | 'create_new';
export type LogLevel = 'basic' | 'detailed';

export interface ImportSettings {
  duplicateHandling: DuplicateHandling;
  validationMode: ValidationMode;
  logLevel: LogLevel;
  batchSize: number;
  notifyOnComplete: boolean;
  skipEmptyValues: boolean;
}

export interface DbColumn {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

export interface ImportJob {
  id: string;
  status: ImportStatus;
  type: ImportType;
  filename: string;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  errorRows: Array<{
    row: number;
    message: string;
  }>;
  settings: ImportSettings;
  columnMapping: Array<{
    csvHeader: string;
    dbField: string;
    required: boolean;
  }>;
  startTime: Date;
  mapping: Record<string, string>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  currentOperation?: string;
}

export interface ImportPreview {
  headers: string[];
  rows: Array<Record<string, string>>;
  validationResults: Array<{
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

export interface BatchSizeOption {
  value: number;
  label: string;
  description: string;
}

export interface ColumnMapping {
  csvHeader: string;
  dbField: string;
  required: boolean;
  validator?: (value: string) => boolean | string;
}

export interface ImportDocument {
  _id: string;
  status: ImportStatus;
  type: ImportType;
  filename: string;
  totalRows: number;
  processedRows: number;
  failedRows: number;
  settings: ImportSettings;
  columnMapping: ColumnMapping[];
  createdAt: Date;
  updatedAt: Date;
  errors?: Array<{
    row: number;
    message: string;
  }>;
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

export interface PreviewColumn {
  header: string;
  field: string;
  required: boolean;
  width?: number;
  validation?: {
    type: 'string' | 'number' | 'date' | 'email' | 'phone';
    pattern?: string;
    min?: number;
    max?: number;
    allowedValues?: string[];
  };
} 
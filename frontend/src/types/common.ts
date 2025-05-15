export enum ImportType {
  EMPLOYEES = 'employees',
  EQUIPMENT = 'equipment',
  COMPANIES = 'companies'
}

export enum ImportStatus {
  PENDING = 'pending',
  VALIDATING = 'validating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
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

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  headers?: string[];
}

export interface PreviewData {
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

export interface ImportProgress {
  status: ImportStatus;
  processedRows: number;
  totalRows: number;
  failedRows: number;
  currentOperation?: string;
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
  currentOperation?: string;
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
} 
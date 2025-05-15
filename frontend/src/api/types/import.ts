import { ImportStatus, ImportType, ValidationMode } from '../../types/import';

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

export interface ColumnMapping {
  csvHeader: string;
  dbField: string;
  required: boolean;
  type: 'string' | 'number' | 'date' | 'enum';
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    allowedValues?: string[];
  };
}

export interface ValidationResult {
  row: number;
  column: string;
  value: string;
  type: 'error' | 'warning';
  message: string;
}

export interface ImportPreview {
  headers: string[];
  rows: Array<Record<string, string>>;
  validationResults: ValidationResult[];
  stats: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    duplicates: number;
  };
}

export interface ImportJob {
  id: string;
  type: ImportType;
  status: ImportStatus;
  filename: string;
  totalRows: number;
  processedRows: number;
  errorRows: number;
  failedRows: number;
  startTime: Date;
  endTime?: Date;
  settings: ImportSettings;
  columnMapping: ColumnMapping[];
  mapping: Record<string, string>;
  errors: ValidationResult[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  currentOperation?: string;
}

export interface DbColumn {
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
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
  mappings: {
    csvColumn: string;
    dbColumn: string;
    transformation?: string;
  }[];
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
  lineNumber: number;
  errors: string[];
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
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'completed_with_errors';
  totalRows: number;
  processedRows: number;
  failedRows: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImportError {
  lineNumber: number;
  rowData: string;
  errorMessage: string;
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
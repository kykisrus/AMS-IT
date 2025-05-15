import mongoose, { Schema, Document } from 'mongoose';
import { ImportDocument, ImportType, ImportStatus, ValidationMode } from '../types/import';

interface ImportModel extends mongoose.Model<ImportDocument> {
  updateProgress(processedRows: number, failedRows: number): Promise<void>;
  addError(row: number, message: string): Promise<void>;
}

const ImportSchema = new Schema<ImportDocument>(
  {
    status: {
      type: String,
      enum: Object.values(ImportStatus),
      default: ImportStatus.PENDING,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(ImportType),
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    totalRows: {
      type: Number,
      default: 0,
    },
    processedRows: {
      type: Number,
      default: 0,
    },
    failedRows: {
      type: Number,
      default: 0,
    },
    settings: {
      duplicateHandling: {
        type: String,
        enum: ['skip', 'update', 'create_new'],
        default: 'skip',
      },
      validationMode: {
        type: String,
        enum: Object.values(ValidationMode),
        default: ValidationMode.STRICT,
      },
      logLevel: {
        type: String,
        enum: ['basic', 'detailed'],
        default: 'basic',
      },
      batchSize: {
        type: Number,
        default: 500,
      },
      notifyOnComplete: {
        type: Boolean,
        default: true,
      },
      skipEmptyValues: {
        type: Boolean,
        default: true,
      },
    },
    columnMapping: [{
      csvHeader: String,
      dbField: String,
      required: Boolean,
    }],
    importErrors: [{
      row: Number,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Индексы для оптимизации запросов
ImportSchema.index({ status: 1 });
ImportSchema.index({ type: 1 });
ImportSchema.index({ createdAt: 1 });

// Виртуальное поле для прогресса
ImportSchema.virtual('progress').get(function(this: ImportDocument) {
  return {
    status: this.status,
    processedRows: this.processedRows,
    totalRows: this.totalRows,
    failedRows: this.failedRows,
  };
});

// Методы для обновления прогресса
ImportSchema.methods.updateProgress = async function(
  this: ImportDocument,
  processedRows: number,
  failedRows: number
) {
  this.processedRows = processedRows;
  this.failedRows = failedRows;
  
  if (this.processedRows === this.totalRows) {
    this.status = ImportStatus.COMPLETED;
  }
  
  await this.save();
};

ImportSchema.methods.addError = async function(
  this: ImportDocument,
  row: number,
  message: string
) {
  this.importErrors.push({ row, message, timestamp: new Date() });
  this.failedRows += 1;
  await this.save();
};

const Import = mongoose.model<ImportDocument, ImportModel>('Import', ImportSchema);

export default Import; 
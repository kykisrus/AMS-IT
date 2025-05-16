import { Request } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { config } from '../config';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Создаем директорию для загрузок, если она не существует
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.directory);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'text/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый формат файла'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
});

export interface UploadedFile {
  filename: string;
  path: string;
  headers: string[];
}

export const uploadFile = async (req: Request): Promise<UploadedFile | null> => {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, {} as any, async (err) => {
      if (err) {
        reject(err);
        return;
      }

      const file = req.file;
      if (!file) {
        resolve(null);
        return;
      }

      try {
        // Читаем первую строку файла для получения заголовков
        const fileContent = fs.readFileSync(file.path, 'utf-8');
        const headers = fileContent.split('\n')[0].split(',').map(h => h.trim());

        resolve({
          filename: file.filename,
          path: file.path,
          headers
        });
      } catch (error) {
        reject(error);
      }
    });
  });
};

export const cleanupUploadedFile = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error);
  }
};

export const getUploadedFilePath = (filename: string): string => {
  return path.join(UPLOAD_DIR, filename);
}; 
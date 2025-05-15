import { Request } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Создаем директорию для загрузок, если она не существует
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Проверяем тип файла
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
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
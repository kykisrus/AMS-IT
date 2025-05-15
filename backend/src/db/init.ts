import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const initDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost/ams-it';
    
    await mongoose.connect(mongoUri);
    
    logger.info('MongoDB connected successfully');
    
    // Создаем индексы для коллекций
    await Promise.all([
      mongoose.connection.collection('imports').createIndex({ status: 1 }),
      mongoose.connection.collection('imports').createIndex({ type: 1 }),
      mongoose.connection.collection('imports').createIndex({ createdAt: 1 }),
    ]);
    
    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  }
};

export const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
}; 
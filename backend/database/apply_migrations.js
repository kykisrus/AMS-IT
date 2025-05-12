const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '/var/www/html/AMS-IT/.env' });

async function applyMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'IT',
    password: process.env.DB_PASSWORD || 'HardWork@1LP',
    database: process.env.DB_NAME || 'ams_it'
  });

  try {
    // Получаем список всех файлов миграций
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

    // Применяем каждую миграцию
    for (const file of sqlFiles) {
      console.log(`Applying migration: ${file}`);
      const migrationPath = path.join(migrationsDir, file);
      const migration = await fs.readFile(migrationPath, 'utf8');
      
      await connection.query(migration);
      console.log(`Successfully applied migration: ${file}`);
    }

    console.log('All migrations have been applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
  } finally {
    await connection.end();
  }
}

applyMigrations(); 
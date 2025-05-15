const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
};

async function migrate() {
  const connection = await mysql.createConnection(config);
  
  try {
    // Создаем таблицу для отслеживания миграций, если её нет
    await connection.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Получаем список всех выполненных миграций
    const [appliedMigrations] = await connection.query('SELECT name FROM migrations');
    const appliedMigrationNames = appliedMigrations.map(m => m.name);

    // Читаем все файлы миграций
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(f => f.endsWith('.sql')).sort();

    // Применяем новые миграции
    for (const file of migrationFiles) {
      if (!appliedMigrationNames.includes(file)) {
        console.log(`Applying migration: ${file}`);
        
        const migration = await fs.readFile(path.join(migrationsDir, file), 'utf8');
        await connection.query(migration);
        await connection.query('INSERT INTO migrations (name) VALUES (?)', [file]);
        
        console.log(`Migration ${file} applied successfully`);
      } else {
        console.log(`Migration ${file} already applied`);
      }
    }

    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate(); 
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    multipleStatements: true
  });

  try {
    // Создаем базу данных, если она не существует
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database.database}`);
    await connection.query(`USE ${config.database.database}`);

    // Читаем и выполняем все SQL-файлы из директории migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Выполняется миграция: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await connection.query(sql);
      console.log(`Миграция ${file} выполнена успешно`);
    }

    console.log('Все миграции выполнены успешно');
  } catch (error) {
    console.error('Ошибка при выполнении миграций:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigrations().catch(console.error); 
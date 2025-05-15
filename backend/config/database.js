const mysql = require('mysql2/promise');
const config = require('./env.config');

const pool = mysql.createPool(config.database);

// Проверка подключения
pool.getConnection()
  .then(connection => {
    console.log('Successfully connected to the database');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.stack);
  });

module.exports = pool; 
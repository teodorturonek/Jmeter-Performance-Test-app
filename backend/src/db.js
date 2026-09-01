const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'tasks_db',
  user: process.env.DB_USER || 'tasks_user',
  password: process.env.DB_PASSWORD || 'tasks_pass',
});

module.exports = pool;

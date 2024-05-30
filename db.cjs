const { Pool } = require('pg');

// Create a new pool instance with your PostgreSQL connection details
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'library',
  password: 'Priya@pg',
  port: 5432, // Default PostgreSQL port
});

module.exports = pool;
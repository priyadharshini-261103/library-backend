const { Pool } = require('pg');

// Create a new pool instance with your PostgreSQL connection details
// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'library',
//   password: 'Priya@pg',
//   port: 5432, 
// });
const DB_URL = 'postgresql://library_owner:SYvKbEV6u0es@ep-dry-smoke-a5kg7ezh.us-east-2.aws.neon.tech/library?sslmode=require';
const pool = new Pool({
  connectionString: DB_URL

});
module.exports = pool;
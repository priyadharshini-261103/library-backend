const db = require('../db');

const findAdminByUsernameAndPassword = async (username, password) => {
  const res = await db.query('SELECT * FROM admins WHERE username = $1 AND password = $2', [username, password]);
  return res.rows[0];
};

module.exports = { findAdminByUsernameAndPassword };

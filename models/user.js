const db = require('../db');

const findUserByUsernameAndPassword = async (username, password) => {
  const res = await db.query('SELECT * FROM users WHERE email = $1 AND password = $2', [username, password]);
  return res.rows[0];
};

const findUserByEmail = async (email) => {
  const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
};

const createUser = async (user) => {
  const { full_name, date_of_birth, address, phone_number, email, password } = user;
  const res = await db.query('INSERT INTO users (full_name, date_of_birth, address, phone_number, email, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [full_name, date_of_birth, address, phone_number, email, password]);
  return res.rows[0];
};

module.exports = { findUserByUsernameAndPassword, findUserByEmail, createUser };

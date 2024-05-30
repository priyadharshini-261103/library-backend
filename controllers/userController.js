const { findUserByUsernameAndPassword, findUserByEmail, createUser } = require('../models/user');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await findUserByUsernameAndPassword(username, password);
    if (user) {
      res.status(200).send({ message: 'Login successful', user });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

const signup = async (req, res) => {
  try {
    const user = req.body;
    const existingUser = await findUserByEmail(user.email);
    if (existingUser) {
      return res.status(409).send({ message: 'Email already exists' });
    }

    const newUser = await createUser(user);
    res.status(201).send({ message: 'Signup successful', user: newUser });
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

module.exports = { login, signup };

const { findAdminByUsernameAndPassword } = require('../models/admin');

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await findAdminByUsernameAndPassword(username, password);
    if (admin) {
      res.status(200).send({ message: 'Login successful', admin });
    } else {
      res.status(401).send({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Internal server error:', error);
    res.status(500).send({ message: 'Internal server error' });
  }
};

module.exports = { login };

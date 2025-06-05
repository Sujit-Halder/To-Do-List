const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const generateAccessToken = require('../utils/generateTokens');

exports.signup = async (req, res) => {
  const user = req.body;

  const existing = await userModel.findByEmailOrUsername(user.email, user.username);
  if (existing) return res.status(409).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(user.password, 10);
  await userModel.addUser({ ...user, password: hashedPassword });

  res.status(201).json({ message: 'User registered' });
};

exports.signin = async (req, res) => {
  const { identifier, password } = req.body;
  const user = await userModel.findByEmailOrUsername(identifier, identifier);

  if (!user) return res.status(404).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = generateAccessToken(user);

  res.json({ token, user: { username: user.username, email: user.email } });
};

exports.dashboard = async (req, res) => {
  const user = await userModel.findByEmailOrUsername(req.user.email, req.user.username);
  res.json({ message: 'Secure dashboard data', user });
};

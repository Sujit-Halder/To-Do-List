const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateAccessToken, base64 } = require('../utils/generateTokens');
const logger = require('../utils/logger'); // Import the logger
const DEFAULT_IMAGE = '../data/no-photo.png';

exports.signup = async (req, res) => {
  try {
    const user = req.body;

    // Check if req.body is empty
    if (!user || Object.keys(user).length === 0) {
      logger.warn('Signup failed: Request body is empty');
      return res.status(400).json({ message: 'Request body is empty' });
    }

    logger.info(`Sign Up request - ${user.email}`);

    const existing = await userModel.findByEmail(user.email);
    if (existing) {
      logger.warn(`Signup failed: User already exists - ${user.email}`);
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);

    // Default task lists
    const defaultTaskLists = [
      { name: 'Personal Task', tasks: [] },
      { name: 'Work Task', tasks: [] },
      { name: 'Shopping Task', tasks: [] },
      { name: 'Other Task', tasks: [] }
    ];

    await userModel.addUser({
      ...user,
      password: hashedPassword,
      image: base64(DEFAULT_IMAGE),
      tasklists: defaultTaskLists
    });

    logger.info(`Sign Up Successful - ${user.email}`);
    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    logger.error(`Error during Signup - ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.signin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Check if req.body is empty
    if (!identifier || !password) {
      logger.warn('Signin failed: Identifier and password are required');
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    logger.info(`Sign In request - ${identifier}`);
    const user = await userModel.findByEmailOrUsername(identifier, identifier);
    if (!user) {
      logger.warn(`Signin failed: User not found - ${identifier}`);
      return res.status(404).json({ message: `User ${identifier} not found` });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logger.warn(`Signin failed: Invalid password - ${identifier}`);
      return res.status(401).json({ message: 'Invalid Password' });
    }

    const token = generateAccessToken(user);
    logger.info(`Sign In Successful - ${user.email}`);
    res.json({ message: `Login Successful: ${user.username}`, token });
  } catch (error) {
    logger.error(`Error during SignIn - ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email);
    if (!user) {
      logger.warn(`Dashboard access failed: User not found - ${req.user.email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check overdue tasks for the current user
    user.tasklists.forEach((tasklist) => {
      tasklist.tasks.forEach((task) => {
        const reminderDateTime = new Date(`${task.date}T${task.time}`);
        if (new Date() > reminderDateTime && task.status !== 'Completed') {
          task.status = 'Overdue';
        } else if (new Date() < reminderDateTime && task.status === 'Overdue') {
          task.status = 'Not Started';
        }
      });
    });

    await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });

    logger.info(`Dashboard Opened Successfully - ${user.email}`);
    res.json({ message: 'Secure dashboard data', user });
  } catch (error) {
    logger.error(`Error during Dashboard Access - ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
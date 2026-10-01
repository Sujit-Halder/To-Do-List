const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateAccessToken } = require('../utils/generateTokens');
const logger = require('../utils/logger'); // Import the logger
const activityModel = require('../models/activityModel');

exports.signup = async (req, res) => {
  try {
    const user = req.body;

    // Check if req.body is empty
    if (!user || Object.keys(user).length === 0) {
      logger.warn('Signup failed: Request body is empty');
      return res.status(400).json({ message: 'Request body is empty' });
    }

    logger.info(`Sign Up request - ${user.email}`);

    const existing = await userModel.findByEmailOrUsername(user.email, user.username);
    if (existing) {
      logger.warn(`Signup failed: User already exists - ${user.email}`);
      return res.status(409).json({ message: 'An account with that email or username already exists.' });
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
      image: '',
      tasklists: defaultTaskLists
    });
    await activityModel.record({ email: user.email, eventType: 'account.created', message: 'Account created successfully.' });

    logger.info(`Sign Up Successful - ${user.email}`);
    res.status(201).json({ message: 'Your account is ready. Sign in to continue.' });
  } catch (error) {
    logger.error(`Error during Signup - ${error.message}`);
    res.status(500).json({ message: 'We could not create your account. Please try again.' });
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
      return res.status(401).json({ message: 'The email, username, or password is incorrect.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      await activityModel.record({ userId: user.id, level: 'warning', eventType: 'auth.failed', message: 'A sign-in attempt failed because the password was incorrect.' });
      logger.warn(`Signin failed: Invalid password - ${identifier}`);
      return res.status(401).json({ message: 'The email, username, or password is incorrect.' });
    }

    const token = generateAccessToken(user);
    await activityModel.record({ userId: user.id, eventType: 'auth.signed_in', message: 'Signed in successfully.' });
    logger.info(`Sign In Successful - ${user.email}`);
    res.json({ message: `Welcome back, ${user.name}.`, token });
  } catch (error) {
    logger.error(`Error during SignIn - ${error.message}`);
    res.status(500).json({ message: 'We could not sign you in. Please try again.' });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const user = await userModel.findByEmail(req.user.email);
    if (!user) {
      logger.warn(`Dashboard access failed: User not found - ${req.user.email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info(`Dashboard Opened Successfully - ${user.email}`);
    res.json({ message: 'Secure dashboard data', user });
  } catch (error) {
    logger.error(`Error during Dashboard Access - ${error.message}`);
    res.status(500).json({ message: 'We could not load your dashboard. Please refresh and try again.' });
  }
};

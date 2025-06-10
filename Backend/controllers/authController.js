const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const { generateAccessToken, base64 } = require('../utils/generateTokens');
const DEFAULT_IMAGE = '../data/no-photo.png';

exports.signup = async (req, res) => {
  const user = req.body;

  const existing = await userModel.findByEmailOrUsername(user.email, user.username);
  if (existing) return res.status(409).json({ message: 'User already exists' });

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
  const user = await userModel.findByEmail(req.user.email);
  if (!user) return res.status(404).json({ message: 'User not found' });

   // Check overdue tasks for the current user
   user.tasklists.forEach((tasklist) => {
    tasklist.tasks.forEach((task) => {
      const reminderDateTime = new Date(`${task.date}T${task.time}`);
      if (new Date() > reminderDateTime && task.status !== 'Completed') {
        task.status = 'Overdue';
      }
    });
  });

  await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
  // Return secure dashboard data
  res.json({ message: 'Secure dashboard data', user });
};



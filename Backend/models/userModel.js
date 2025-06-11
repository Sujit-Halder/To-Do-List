const fs = require('fs').promises;
const path = require('path');
const { ensureFileExists } = require('../utils/fileHandler');

// Constants
const USERS_FILE = path.join(__dirname, '../data/users.json');
const USERS_BACKUP_FILE = `${USERS_FILE}.backup`;

// Ensure the users file exists before anything else
ensureFileExists(USERS_FILE, []);

// Export constants
exports.USERS_FILE = USERS_FILE;
exports.USERS_BACKUP_FILE = USERS_BACKUP_FILE;

// Read users from file
const getUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error reading users file:', err.message);
    return [];
  }
};

exports.getUsers = getUsers;

// Save users to file
const saveUsers = async (users) => {
  if (!Array.isArray(users)) {
    console.error('Invalid users data. Aborting save operation.');
    return;
  }

  try {
    await fs.copyFile(USERS_FILE, USERS_BACKUP_FILE);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error saving users:', err.message);
  }
};

exports.saveUsers = saveUsers;

// Check and update task statuses for a single user
const checkOverdueTasks = async (user) => {
  const currentDateTime = new Date();

  user.tasklists?.forEach((tasklist) => {
    tasklist.tasks?.forEach((task) => {
      const reminderDateTime = new Date(`${task.date}T${task.time}`);
      if (currentDateTime > reminderDateTime && task.status !== 'Completed') {
        task.status = 'Overdue';
      } else if (currentDateTime < reminderDateTime && task.status === 'Overdue') {
        task.status = 'Not Started';
      }
    });
  });
};

exports.checkOverdueTasks = checkOverdueTasks;

// Check and update overdue tasks for all users
exports.checkOverdueTasksForAllUsers = async () => {
  const users = await getUsers();
  const currentDateTime = new Date();

  const updatedUsers = users.map((user) => {
    user.tasklists?.forEach((tasklist) => {
      tasklist.tasks?.forEach((task) => {
        const reminderDateTime = new Date(`${task.date}T${task.time}`);
        if (currentDateTime > reminderDateTime && task.status !== 'Completed') {
          task.status = 'Overdue';
        } else if (currentDateTime < reminderDateTime && task.status === 'Overdue') {
          task.status = 'Not Started';
        }
      });
    });
    return user;
  });

  await saveUsers(updatedUsers);
};

// Add a new user
exports.addUser = async (user) => {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
};

// Find user by email
exports.findByEmail = async (email) => {
  const users = await getUsers();
  return users.find(u => u.email === email);
};

// Find user by email or username
exports.findByEmailOrUsername = async (email, username) => {
  const users = await getUsers();
  return users.find(u => u.email === email || u.username === username);
};

// Update user by email
exports.updateUserByEmail = async (email, updates) => {
  const users = await getUsers();
  const index = users.findIndex(u => u.email === email);
  if (index === -1) return false;

  const updatedUser = { ...users[index], ...updates };
  await checkOverdueTasks(updatedUser);

  users[index] = updatedUser;
  await saveUsers(users);
  return true;
};

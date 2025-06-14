const fs = require('fs').promises;
const path = require('path');
const { ensureFileExists } = require('../utils/fileHandler');
const logger = require('../utils/logger'); // Import logger

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
    const users = data ? JSON.parse(data) : [];
    // logger.info(`Successfully read ${users.length} users from file.`);
    return users;
  } catch (err) {
    logger.error(`Error reading users file: ${err.message}`);
    return [];
  }
};

exports.getUsers = getUsers;

// Save users to file
const saveUsers = async (users) => {
  if (!Array.isArray(users)) {
    logger.error('Invalid users data. Aborting save operation.');
    return;
  }

  try {
    await fs.copyFile(USERS_FILE, USERS_BACKUP_FILE);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    // logger.info(`Successfully saved ${users.length} users to file.`);
  } catch (err) {
    logger.error(`Error saving users: ${err.message}`);
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

  // logger.info(`Checked overdue tasks for user: ${user.email}`);
};

exports.checkOverdueTasks = checkOverdueTasks;

// Check and update overdue tasks for all users
exports.checkOverdueTasksForAllUsers = async () => {
  try {
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
    // logger.info('Successfully checked and updated overdue tasks for all users.');
  } catch (err) {
    logger.error(`Error checking overdue tasks for all users: ${err.message}`);
  }
};

// Add a new user
exports.addUser = async (user) => {
  try {
    const users = await getUsers();
    users.push(user);
    await saveUsers(users);
    logger.info(`Added new user: ${user.email}`);
  } catch (err) {
    logger.error(`Error adding new user: ${err.message}`);
  }
};

// Find user by email
exports.findByEmail = async (email) => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      // logger.info(`Found user by email: ${email}`);
    } else {
      logger.warn(`User not found by email: ${email}`);
    }
    return user;
  } catch (err) {
    logger.error(`Error finding user by email: ${err.message}`);
    return null;
  }
};

// Find user by email or username
exports.findByEmailOrUsername = async (email, username) => {
  try {
    const users = await getUsers();
    const user = users.find(u => u.email === email || u.username === username);
    if (user) {
      // logger.info(`Found user by email or username: ${email || username}`);
    } else {
      logger.warn(`User not found by email or username: ${email || username}`);
    }
    return user;
  } catch (err) {
    logger.error(`Error finding user by email or username: ${err.message}`);
    return null;
  }
};

// Update user by email
exports.updateUserByEmail = async (email, updates) => {
  try {
    const users = await getUsers();
    const index = users.findIndex(u => u.email === email);
    if (index === -1) {
      logger.warn(`User not found for update by email: ${email}`);
      return false;
    }

    const updatedUser = { ...users[index], ...updates };
    await checkOverdueTasks(updatedUser);

    users[index] = updatedUser;
    await saveUsers(users);
    // logger.info(`Updated user by email: ${email}`);
    return true;
  } catch (err) {
    logger.error(`Error updating user by email: ${err.message}`);
    return false;
  }
};
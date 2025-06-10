const fs = require('fs').promises;
const path = require('path');
const USERS_FILE = path.join(__dirname, '../data/users.json');
const { ensureFileExists } = require('../utils/fileHandler');

ensureFileExists(USERS_FILE, []);

async function getUsers() {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
  } catch (err) {
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function checkOverdueTasks(user) {
  const currentDateTime = new Date();

  user.tasklists.forEach((tasklist) => {
    tasklist.tasks.forEach((task) => {
      const reminderDateTime = new Date(`${task.date}T${task.time}`);
      if (currentDateTime > reminderDateTime && task.status !== 'Completed') {
        task.status = 'Overdue'; // Update task status to overdue
      }
    });
  });
}

exports.checkOverdueTasksForAllUsers = async () => {
  const users = await getUsers();
  const currentDateTime = new Date();

  const updatedUsers = users.map((user) => {
    user.tasklists.forEach((tasklist) => {
      tasklist.tasks.forEach((task) => {
        const reminderDateTime = new Date(`${task.date}T${task.time}`);
        if (currentDateTime > reminderDateTime && task.status !== 'Completed') {
          task.status = 'Overdue';
        }
      });
    });
    return user;
  });

  await saveUsers(updatedUsers);
}


exports.addUser = async (user) => {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
};

exports.findByEmail = async (email) => {
  const users = await getUsers();
  return users.find(u => u.email === email);
};


exports.findByEmailOrUsername = async (email, username) => {
  const users = await getUsers();
  return users.find(u => u.email === email || u.username === username);
};


exports.updateUserByEmail = async (email, updates) => {
  const users = await getUsers();
  const index = users.findIndex(u => u.email === email);
  if (index === -1) return false;
  // Merge updates into the user object
  const updatedUser = { ...users[index], ...updates };

  // Check for overdue tasks
  await checkOverdueTasks(updatedUser);

  // Save the updated user data
  users[index] = updatedUser;
  await saveUsers(users);
  return true;
};

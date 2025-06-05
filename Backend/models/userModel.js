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
    // If file is corrupted or unreadable, reset to empty array
    await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

async function saveUsers(users) {
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

exports.addUser = async (user) => {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
};

exports.findByEmailOrUsername = async (email, username) => {
  const users = await getUsers();
  return users.find(u => u.email === email || u.username === username);
};

const { db } = require('../database');

const userColumns = `id, username, email, password_hash AS password, name, phone, age,
  gender, profession, image, created_at AS creationTime, updated_at AS modificationTime`;

const mapTask = (row) => {
  const due = row.due_at || '';
  const [date = '', timeWithZone = ''] = due.split('T');
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    date,
    time: timeWithZone.slice(0, 5),
    priority: row.priority,
    imageUrl: row.image_url,
    emailNotification: Boolean(row.email_notification),
    emailSent: Boolean(row.email_sent),
    creationTime: row.created_at,
    modificationTime: row.updated_at,
    completionTime: row.completed_at || '',
  };
};

const getTasklistsByUserId = (userId) => {
  const lists = db.prepare(`
    SELECT tl.id AS list_id, tl.name AS list_name, t.*
    FROM task_lists tl
    LEFT JOIN tasks t ON t.task_list_id = tl.id
    WHERE tl.user_id = ?
    ORDER BY tl.position, tl.id, t.due_at, t.created_at
  `).all(userId);

  const tasklists = [];
  const byId = new Map();
  for (const row of lists) {
    let list = byId.get(row.list_id);
    if (!list) {
      list = { name: row.list_name, tasks: [] };
      byId.set(row.list_id, list);
      tasklists.push(list);
    }
    if (row.id) list.tasks.push(mapTask(row));
  }
  return tasklists;
};

const hydrateUser = (row) => row ? { ...row, tasklists: getTasklistsByUserId(row.id) } : null;

exports.findByEmail = async (email) => hydrateUser(
  db.prepare(`SELECT ${userColumns} FROM users WHERE email = ? COLLATE NOCASE`).get(email)
);

exports.findByEmailOrUsername = async (email, username) => hydrateUser(
  db.prepare(`SELECT ${userColumns} FROM users WHERE email = ? COLLATE NOCASE OR username = ? COLLATE NOCASE LIMIT 1`).get(email, username)
);

exports.addUser = async (user) => {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = db.prepare(`
      INSERT INTO users (username, email, password_hash, name, phone, age, gender, profession, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(user.username.trim(), user.email.trim().toLowerCase(), user.password, user.name.trim(), user.phone || '', Number(user.age) || null, user.gender || '', user.profession || '', user.image || '');

    const insertList = db.prepare('INSERT INTO task_lists (user_id, name, position) VALUES (?, ?, ?)');
    (user.tasklists || []).forEach((list, index) => insertList.run(result.lastInsertRowid, list.name.trim(), index));
    db.exec('COMMIT');
    return result.lastInsertRowid;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

exports.updateImage = async (email, image) => db.prepare(`
  UPDATE users SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ? COLLATE NOCASE
`).run(image || '', email).changes > 0;

exports.getTasklists = async (email) => {
  const user = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email);
  return user ? getTasklistsByUserId(user.id) : null;
};

exports.addTaskList = async (email, name) => {
  const user = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email);
  if (!user) return null;
  const position = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM task_lists WHERE user_id = ?').get(user.id).next;
  db.prepare('INSERT INTO task_lists (user_id, name, position) VALUES (?, ?, ?)').run(user.id, name.trim(), position);
  return getTasklistsByUserId(user.id);
};

exports.renameTaskList = async (email, oldName, newName) => {
  const result = db.prepare(`
    UPDATE task_lists SET name = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = (SELECT id FROM users WHERE email = ? COLLATE NOCASE) AND name = ? COLLATE NOCASE
  `).run(newName.trim(), email, oldName);
  return result.changes ? exports.getTasklists(email) : null;
};

exports.deleteTaskList = async (email, name) => {
  const result = db.prepare(`
    DELETE FROM task_lists WHERE user_id = (SELECT id FROM users WHERE email = ? COLLATE NOCASE) AND name = ? COLLATE NOCASE
  `).run(email, name);
  return result.changes ? exports.getTasklists(email) : null;
};

exports.createTask = async (email, tasklistName, task) => {
  const user = db.prepare('SELECT id FROM users WHERE email = ? COLLATE NOCASE').get(email);
  if (!user) return null;
  let list = db.prepare('SELECT id FROM task_lists WHERE user_id = ? AND name = ? COLLATE NOCASE').get(user.id, tasklistName);
  if (!list) {
    const position = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM task_lists WHERE user_id = ?').get(user.id).next;
    const result = db.prepare('INSERT INTO task_lists (user_id, name, position) VALUES (?, ?, ?)').run(user.id, tasklistName.trim(), position);
    list = { id: result.lastInsertRowid };
  }
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO tasks (id, task_list_id, title, status, due_at, priority, image_url, email_notification, email_sent, created_at, updated_at, completed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(task.id, list.id, task.title.trim(), task.status || 'Not Started', `${task.date}T${task.time}`, task.priority || 'Moderate', task.imageUrl || '', task.emailNotification ? 1 : 0, 0, task.creationTime || now, now, task.completionTime || null);
  return getTasklistsByUserId(user.id);
};

exports.updateTask = async (email, task) => {
  const now = new Date().toISOString();
  const result = db.prepare(`
    UPDATE tasks SET title = ?, status = ?, due_at = ?, priority = ?, image_url = ?,
      email_notification = ?, email_sent = CASE WHEN email_notification != ? THEN 0 ELSE email_sent END,
      updated_at = ?, completed_at = ?
    WHERE id = ? AND task_list_id IN (SELECT id FROM task_lists WHERE user_id = (SELECT id FROM users WHERE email = ? COLLATE NOCASE))
  `).run(task.title.trim(), task.status, `${task.date}T${task.time}`, task.priority, task.imageUrl || '', task.emailNotification ? 1 : 0, task.emailNotification ? 1 : 0, now, task.completionTime || null, task.id, email);
  return result.changes ? exports.getTasklists(email) : null;
};

exports.deleteTask = async (email, taskId) => {
  const result = db.prepare(`
    DELETE FROM tasks WHERE id = ? AND task_list_id IN (SELECT id FROM task_lists WHERE user_id = (SELECT id FROM users WHERE email = ? COLLATE NOCASE))
  `).run(taskId, email);
  return result.changes ? exports.getTasklists(email) : null;
};

exports.toggleTaskComplete = async (email, taskId) => {
  const task = db.prepare(`
    SELECT t.status FROM tasks t JOIN task_lists tl ON tl.id = t.task_list_id JOIN users u ON u.id = tl.user_id
    WHERE t.id = ? AND u.email = ? COLLATE NOCASE
  `).get(taskId, email);
  if (!task) return null;
  const completed = task.status !== 'Completed';
  db.prepare(`UPDATE tasks SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?`)
    .run(completed ? 'Completed' : 'Not Started', completed ? new Date().toISOString() : null, new Date().toISOString(), taskId);
  return exports.getTasklists(email);
};

exports.checkOverdueTasksForAllUsers = async () => db.prepare(`
  UPDATE tasks SET status = CASE WHEN due_at < ? THEN 'Overdue' ELSE 'Not Started' END, updated_at = ?
  WHERE status != 'Completed' AND ((due_at < ? AND status != 'Overdue') OR (due_at >= ? AND status = 'Overdue'))
`).run(...(() => {
  const date = new Date();
  const local = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return [local, date.toISOString(), local, local];
})()).changes;

exports.getPendingReminders = async (from, until) => db.prepare(`
  SELECT t.id AS taskId, t.title AS taskTitle, t.due_at AS taskDueDate,
    u.email AS userEmail, u.phone AS userPhone, u.name AS userName
  FROM tasks t JOIN task_lists tl ON tl.id = t.task_list_id JOIN users u ON u.id = tl.user_id
  WHERE t.email_notification = 1 AND t.email_sent = 0 AND t.status != 'Completed' AND t.due_at > ? AND t.due_at <= ?
  ORDER BY t.due_at LIMIT 100
`).all(from, until);

exports.markReminderSent = async (taskId) => db.prepare('UPDATE tasks SET email_sent = 1, updated_at = ? WHERE id = ?').run(new Date().toISOString(), taskId).changes > 0;

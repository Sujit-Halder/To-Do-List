const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATABASE_FILE = path.join(__dirname, 'data', 'taskpro.sqlite');
const db = new DatabaseSync(DATABASE_FILE);

db.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA busy_timeout = 5000;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL COLLATE NOCASE UNIQUE,
    email TEXT NOT NULL COLLATE NOCASE UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    age INTEGER,
    gender TEXT NOT NULL DEFAULT '',
    profession TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE TABLE IF NOT EXISTS task_lists (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL COLLATE NOCASE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
  ) STRICT;

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    task_list_id INTEGER NOT NULL REFERENCES task_lists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Not Started' CHECK(status IN ('Not Started', 'In Progress', 'Completed', 'Overdue')),
    due_at TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Moderate' CHECK(priority IN ('High', 'Moderate', 'Low')),
    image_url TEXT NOT NULL DEFAULT '',
    email_notification INTEGER NOT NULL DEFAULT 0 CHECK(email_notification IN (0, 1)),
    email_sent INTEGER NOT NULL DEFAULT 0 CHECK(email_sent IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT
  ) STRICT;

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level TEXT NOT NULL DEFAULT 'info' CHECK(level IN ('info', 'warning', 'error')),
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) STRICT;

  CREATE INDEX IF NOT EXISTS idx_task_lists_user_position ON task_lists(user_id, position, id);
  CREATE INDEX IF NOT EXISTS idx_tasks_list_due ON tasks(task_list_id, due_at);
  CREATE INDEX IF NOT EXISTS idx_tasks_status_due ON tasks(status, due_at);
  CREATE INDEX IF NOT EXISTS idx_tasks_reminders ON tasks(due_at, email_sent)
    WHERE email_notification = 1 AND email_sent = 0 AND status != 'Completed';
  CREATE INDEX IF NOT EXISTS idx_activity_user_created ON activity_logs(user_id, created_at DESC, id DESC);
  CREATE INDEX IF NOT EXISTS idx_activity_user_level ON activity_logs(user_id, level, created_at DESC);
`);

module.exports = { db, DATABASE_FILE };

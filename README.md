# TaskPro+

A JWT-authenticated task manager with task lists, due-date tracking, email/SMS reminders, filtering, sorting, and progress summaries.

## Data storage

The backend uses SQLite through Node's built-in `node:sqlite` module. The database is created automatically at `Backend/data/taskpro.sqlite` when the backend starts.

The relational structure is:

- `users`
- `task_lists`, linked to `users` with cascading deletion
- `tasks`, linked to `task_lists` with cascading deletion

Foreign keys, uniqueness constraints, status/priority checks, WAL journaling, and indexes for dashboard, due-date, status, and reminder queries are enabled automatically. Runtime database and log files are intentionally ignored by Git.

## Run locally

1. Configure the environment files in `Backend` and `Frontend`.
2. Run `npm install` in both folders.
3. Run `npm start` in `Backend`.
4. Run `npm run dev` in `Frontend`.

Node.js 22.5 or later is required for `node:sqlite`.

See [System Documentation](docs/SYSTEM_DOCUMENTATION.md) for configuration, schema, API, interface behavior, activity logging, notifications, backup, security and troubleshooting details.

See the [Change Log](docs/CHANGELOG.md) for a consolidated record of implemented updates.

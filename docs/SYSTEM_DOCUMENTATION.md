# TaskPro+ System Documentation

## 1. Overview

TaskPro+ is a full-stack task manager with JWT authentication, relational task storage, user activity history, scheduled overdue processing, and email/SMS reminders.

### Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 6, Tailwind CSS 4, Axios |
| Backend | Node.js, Express 5 |
| Database | SQLite through Node's built-in `node:sqlite` module |
| Authentication | JSON Web Tokens and bcrypt |
| Scheduling | `node-schedule` |
| Email | Nodemailer over Gmail SMTP |
| SMS | Twilio |
| Operational logs | Winston |

Node.js 22.5 or newer is required because the backend uses `node:sqlite`.

## 2. Project layout

```text
Backend/
  controllers/       HTTP request handlers
  data/              SQLite database and static fallback image
  logs/              Runtime Winston logs
  middlewares/       JWT authentication
  models/            Relational query and activity-log access
  routes/            Express API routes
  utils/             Scheduler, notification clients, templates and logging
  database.js        Schema bootstrap and SQLite configuration
Frontend/
  public/             TaskPro+ icon and public assets
  src/components/     Dashboard UI and activity log
  src/pages/          Application routes
docs/                 System documentation
```

## 3. Environment configuration

Copy each example file to `.env` in the same directory and replace placeholder values. Never commit real credentials.

### Backend

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | HTTP port. Defaults to `5000`. |
| `WEBSITE` | Yes | Allowed frontend origin for CORS, such as `http://localhost:5173`. |
| `JWT_SECRET` | Yes | Long random secret used to sign one-hour access tokens. |
| `REMINDER_NOTIFICATION_MINUTES` | No | Reminder window in minutes. Defaults to `60`. |
| `EMAIL_USER` | For email | Gmail/SMTP sender address. |
| `EMAIL_PASS` | For email | Gmail application password, not the normal account password. |
| `TWILIO_ACCOUNT_SID` | For SMS | Existing Twilio account SID. |
| `TWILIO_AUTH_TOKEN` | For SMS | Existing Twilio authentication token. |
| `TWILIO_PHONE_NUMBER` | For SMS | Existing Twilio sender number. |

Twilio credentials and behavior remain compatible with the previous implementation. SMS delivery can be activated whenever valid credentials are present.

### Frontend

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend base URL, for example `http://localhost:3002`. |

Vite embeds frontend variables at build time. Restart the frontend after changing them.

## 4. Database design

The database is automatically initialized at `Backend/data/taskpro.sqlite`. Foreign keys, WAL journaling, normal synchronous mode and a five-second busy timeout are enabled when the process opens it.

### Relationships

```text
users 1 ──── * task_lists 1 ──── * tasks
  │
  └───────── * activity_logs
```

Deleting a user cascades to all task lists, tasks and activity records. Deleting a task list cascades to its tasks.

### `users`

Stores identity, bcrypt password hashes, profile details and profile-image data. Email and username are case-insensitive and unique.

### `task_lists`

Stores named, ordered lists belonging to one user. `(user_id, name)` is unique.

### `tasks`

Stores task details and notification state. Status is constrained to `Not Started`, `In Progress`, `Completed` or `Overdue`; priority is constrained to `High`, `Moderate` or `Low`.

### `activity_logs`

Stores user-readable audit events with:

- severity: `info`, `warning` or `error`;
- event type such as `task.created` or `notification.failed`;
- a readable message;
- optional JSON metadata with secrets removed;
- UTC database timestamp.

Activity is always queried through the authenticated user ID. Users cannot read one another's activity.

### Indexes

- `idx_task_lists_user_position`: ordered dashboard list loading;
- `idx_tasks_list_due`: tasks by list and due time;
- `idx_tasks_status_due`: overdue/status processing;
- `idx_tasks_reminders`: partial index for unsent reminder scans;
- `idx_activity_user_created`: recent user activity and pagination;
- `idx_activity_user_level`: severity-filtered activity.

## 5. API

All `/api/user/*` and `/api/auth/dashboard` routes require `Authorization: Bearer <token>`.

### Authentication

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account and default task lists. |
| `POST` | `/api/auth/signin` | Authenticate by email or username. |
| `GET` | `/api/auth/dashboard` | Load the current user and relational task graph. |

### User and tasks

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/user/update-image` | Save the profile image. |
| `POST` | `/api/user/delete-image` | Remove the profile image. |
| `POST` | `/api/user/tasklists` | Create a task list. |
| `PUT` | `/api/user/tasklists` | Rename a task list. |
| `DELETE` | `/api/user/tasklists` | Delete a list and cascade its tasks. |
| `POST` | `/api/user/task` | Create a task. |
| `PUT` | `/api/user/task` | Update a task. |
| `DELETE` | `/api/user/task` | Delete a task. |
| `PATCH` | `/api/user/task/complete` | Toggle task completion. |
| `GET` | `/api/user/activity` | Read paginated, filtered activity. |

Activity query parameters are `limit` (maximum 100), `offset`, `level`, and `eventType`.

## 6. Activity and operational logging

TaskPro+ uses two complementary log systems:

1. **Activity logs** are database records intended for authenticated users. They are readable from Dashboard → Activity Log.
2. **Operational logs** are Winston files intended for developers and server operators. General events are written to `Backend/logs/general.log`, while errors are also written to `Backend/logs/error.log`.

The activity log records account creation, sign-in, failed password attempts, profile changes, task-list changes, task changes, notification delivery, and notification failures. Passwords, JWTs, authorization headers and provider secrets are filtered out.

Runtime logs and the SQLite database are ignored by Git.

## 7. Notification lifecycle

Every minute the scheduler:

1. updates overdue task states with one indexed SQL statement;
2. finds up to 100 eligible tasks due within `REMINDER_NOTIFICATION_MINUTES`;
3. sends the branded HTML email;
4. sends the Twilio SMS when all existing Twilio credentials and a destination phone number are available; otherwise SMS is safely skipped;
5. marks the reminder as sent;
6. records delivery or failure in the user's activity log.

The email template escapes user-provided values before inserting them into HTML. Changing `REMINDER_NOTIFICATION_MINUTES` requires restarting the backend.

## 8. Frontend preferences

The top-right controls provide:

- light/dark theme selection;
- compact, comfortable and large font sizing.

Preferences are saved locally in the browser as `taskpro-theme` and `taskpro-font-size`. They do not contain personal data and do not need to be synchronized with the backend.

The Settings screen provides the same theme and text-size options plus full/reduced motion. The Help screen provides searchable task, reminder, activity, appearance and session guidance. Pointer devices receive hover elevation, while touch devices receive short press feedback without depending on hover-only controls.

### Branding and icon placement

The application icon is stored at `Frontend/public/taskpro.svg`. It is used as the browser favicon, dashboard identity, landing-page mark, authentication identity, and Settings illustration. The SVG includes accessible title and description metadata. The browser theme color is the primary coral color.

### Theme visibility rules

Dark mode uses dedicated canvas, surface, input, border, and text colors rather than a generic inversion. Information, success, warning, overdue, error, and selected states retain distinct blue, green, amber/orange, red, and coral treatments. Dropdown options, keyboard hints, disabled controls, form fields, cards, and authentication backgrounds receive explicit dark-theme styles. Preferences are applied before React renders to avoid a light-theme flash.

### Task Categories interaction

Task Categories is a floating popover anchored to the sidebar item, so opening it or adding lists never moves Settings, Help, or Logout. Desktop displays it beside the sidebar; mobile displays it as an overlay within the sidebar.

The popover intentionally has no nested scrollbar. It displays four task lists per page with Previous/Next controls and a page indicator. This keeps the panel height predictable while allowing any number of task lists. The current page is clamped after deletion, and creating a new list opens its final page automatically.

Creating a list uses an inline form rather than a browser prompt. It provides:

- automatic focus;
- live character count and a 60-character limit;
- empty and case-insensitive duplicate-name validation;
- Enter to create and Escape to cancel;
- server error feedback beside the field;
- disabled/loading states during submission;
- Create and Cancel controls that remain reachable for long collections.

Selection, creation, rename, and cascade deletion remain available. Hidden popover controls are removed from keyboard navigation with `inert`, and mobile navigation closes only after selecting a destination rather than while managing categories.

### Interaction feedback

Pointer devices receive card elevation and icon movement on hover. Touch devices receive brief press scaling with browser tap highlighting disabled. Users who select reduced motion—or whose operating system requests reduced motion—receive effectively instant transitions.

Routine feedback uses a global accessible toast region rather than blocking browser alerts. Toasts support success, information, warning, and error states, dismiss automatically, and can be closed manually. Task-list renaming and deletion use inline controls instead of browser prompts, while destructive list deletion clearly warns that related tasks are removed through the database cascade. Task panels display designed empty states when filters or task status leave no matching items.

## 9. Development and validation

```powershell
cd Backend
npm install
npm start
```

```powershell
cd Frontend
npm install
npm run dev
```

Before deployment:

```powershell
cd Frontend
npm run lint
npm run build
```

Database integrity can be inspected with Node:

```powershell
node -e 'const {db}=require("./database"); console.log(db.prepare("PRAGMA integrity_check").get()); db.close()'
```

## 10. Backup and recovery

Stop the backend before taking a filesystem copy of `taskpro.sqlite`, or use SQLite's online backup facilities while the server is active. When WAL mode is active, copying only the main file while the process is running may omit recent transactions.

To reset all application data, stop the backend and remove `taskpro.sqlite`, `taskpro.sqlite-wal`, and `taskpro.sqlite-shm`. The schema will be recreated on the next start. This permanently removes user data.

## 11. Security notes

- Use a unique, high-entropy `JWT_SECRET` in every environment.
- Use an email application password and restrict the sending account.
- Restrict production CORS to the deployed frontend origin.
- Serve production traffic over HTTPS.
- Do not expose SQLite or log files through a static file server.
- Rotate provider credentials if they are ever committed or displayed.
- Profile images are currently stored as data URLs; enforce deployment-specific request-size and retention policies if large-scale use is expected.

## 12. Troubleshooting

| Symptom | Check |
| --- | --- |
| Frontend cannot reach backend | Confirm `VITE_API_URL`, backend port, and CORS `WEBSITE`. |
| Session immediately expires | Confirm the same `JWT_SECRET` remains configured across restarts. |
| Email is not sent | Verify `EMAIL_USER`, application password, provider SMTP access, and activity/error logs. |
| SMS is not sent | Verify all three Twilio variables and the destination-number eligibility for the account. |
| Reminders arrive at the wrong interval | Confirm `REMINDER_NOTIFICATION_MINUTES` and restart the backend. |
| Database is locked | Ensure only expected application processes use it and retain the configured busy timeout/WAL mode. |
| Activity page is empty | Perform an account or task action, then refresh the page; confirm authentication is valid. |

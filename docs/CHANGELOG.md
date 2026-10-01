# TaskPro+ Change Log

This file consolidates the updates implemented during the current redesign and architecture revision.

## 2026-10-01

### Interaction polish

- Replaced disruptive browser alerts with accessible, non-blocking toast notifications.
- Added success, information, warning, and error toast styles with automatic dismissal and manual close controls.
- Added user-visible success feedback for task creation, editing, deletion, completion, list changes, authentication, and profile-image updates.
- Replaced browser-based task-list rename prompts with an inline Save/Cancel form.
- Replaced browser delete confirmation with an inline Keep/Delete safety step that explains cascading task deletion.
- Added designed empty states for active and completed task areas instead of leaving blank panels.

### Task Categories usability

- Replaced the expanding sidebar list with a floating popover so navigation items never move.
- Removed nested category scrolling.
- Added four-item pagination with Previous/Next controls and a page indicator.
- Kept create and cancel controls reachable regardless of list count.
- Added compact list rows with touch, hover, and keyboard-focus feedback.
- Preserved list selection, rename, delete, and creation behavior.
- Replaced the browser prompt with an inline list-name form.
- Added empty, duplicate, and length validation, live character count, loading feedback, and inline errors.
- Added Enter-to-create and Escape-to-cancel behavior.
- Added smooth popover opening, closing, and chevron feedback.

### Settings, Help, theme and interaction

- Implemented functional Settings and Help sidebar destinations.
- Added light/dark theme controls and compact, comfortable, and large font sizes.
- Added full/reduced motion preferences.
- Persisted preferences in browser local storage and applied them before application render.
- Added semantic dark-mode colors for cards, inputs, borders, dropdowns, statuses, errors, warnings, information, and success.
- Added pointer-aware hover elevation and touch-specific press feedback.
- Added searchable Help topics, expandable answers, shortcuts, privacy notes, and troubleshooting guidance.

### Branding

- Created the TaskPro+ coral task/check SVG icon.
- Replaced the Vite favicon and updated the browser title/theme color.
- Added the icon to the header, landing page, authentication pages, and Settings.

## 2026-09-30

### Relational data storage

- Replaced JSON user storage with SQLite.
- Added normalized `users`, `task_lists`, `tasks`, and `activity_logs` tables.
- Enabled foreign keys, cascading deletion, WAL journaling, busy timeout, strict tables, and integrity constraints.
- Added indexes for dashboard loading, task due dates, statuses, reminders, and activity pagination.
- Replaced full-file rewrites with targeted relational queries and transactions.
- Removed obsolete JSON persistence utilities and legacy stored-data files.

### Activity and operational logging

- Added user-scoped, database-backed activity history.
- Added readable information, warning, and error levels with timestamps and event types.
- Added safe structured metadata with password, token, authorization, and provider-secret filtering.
- Logged account, authentication, profile, task-list, task, notification, and failure events.
- Added the paginated and filterable Activity Log dashboard interface.
- Added HTTP request timing/status logging through Winston while preserving general and error log files.

### Notifications and configuration

- Added `REMINDER_NOTIFICATION_MINUTES` with a 60-minute default.
- Added complete backend and frontend `.env.example` files.
- Added a branded responsive HTML email template with escaped user content.
- Improved SMS reminder wording.
- Preserved the existing Twilio credentials and made SMS delivery safely optional when configuration is incomplete.
- Prevented an unavailable SMS provider from causing repeated email reminders.
- Recorded notification success and failure in the activity log.

### Interface redesign

- Preserved the original coral visual direction while standardizing layout, typography, spacing, controls, forms, and surfaces.
- Stabilized desktop and mobile dashboard structures.
- Improved sidebar sizing, task cards, progress bars, search results, filters, task modal, landing page, and authentication pages.
- Kept task actions accessible on touch devices instead of relying only on hover.
- Added contextual tooltips and clearer client/server messages.
- Changed uncategorized task creation to use `Other Task`.
- Removed the disruptive dashboard welcome alert.
- Corrected registration redirect and profile-upload error handling.

### Validation performed

- Frontend ESLint passes.
- Frontend production builds pass.
- SQLite integrity checks return `ok` with foreign keys enabled.
- Authentication, task-list/task CRUD, completion, cascading deletion, activity filtering, pagination, and secret removal were exercised.

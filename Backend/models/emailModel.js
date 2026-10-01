const userModel = require('./userModel');

const toLocalDateTime = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

const getTasksInReminderWindow = async () => {
  const now = new Date();
  const reminderMinutes = Math.max(1, Number(process.env.REMINDER_NOTIFICATION_MINUTES) || 60);
  const reminderWindowEnd = new Date(now.getTime() + reminderMinutes * 60 * 1000);
  return userModel.getPendingReminders(toLocalDateTime(now), toLocalDateTime(reminderWindowEnd));
};

module.exports = { getTasksInReminderWindow };

require('dotenv').config();
const schedule = require('node-schedule');
const userModel = require('../models/userModel');
const { getTasksInReminderWindow } = require('../models/emailModel');
const sendEmail = require('./emailSender');
const sendSMSMessage = require('./smsSender');
const logger = require('./logger'); // Import logger
const activityModel = require('../models/activityModel');
const buildReminderEmail = require('./emailTemplate');

const reminderMinutes = Math.max(1, Number(process.env.REMINDER_NOTIFICATION_MINUTES) || 60);

// 🕒 Schedule job to check for overdue tasks every minute
schedule.scheduleJob('* * * * *', async () => {
  const timestamp = new Date();
  // logger.info(`Running overdue task check... [${timestamp}]`);

  try {
    await userModel.checkOverdueTasksForAllUsers();
    // logger.info(`Overdue tasks updated successfully. [${timestamp}]`);
  } catch (error) {
    logger.error(`Error during overdue task check: ${error.message}`);
  }
});

// 🕒 Schedule job to send reminder emails every minute (change to hourly in production)
schedule.scheduleJob('* * * * *', async () => {
  const timestamp = new Date();
  // logger.info(`Checking tasks with 1 hours left... [${timestamp}]`);

  try {
    const tasksToNotify = await getTasksInReminderWindow();

    for (const task of tasksToNotify) {
      const emailContent = buildReminderEmail({ ...task, reminderMinutes });
      const smsContent = `TaskPro+ reminder: “${task.taskTitle}” is due at ${new Date(task.taskDueDate).toLocaleString('en-IN')}. You’ve got this, ${task.userName}!`;

      try {
        await sendEmail(task.userEmail, 'Task Due Reminder', emailContent);
        logger.info(`Email sent to ${task.userEmail} for task "${task.taskTitle}"`);


        const smsResult = await sendSMSMessage(task.userPhone, process.env.TWILIO_PHONE_NUMBER, smsContent);
        if (!smsResult.skipped) logger.info(`SMS sent to ${task.userPhone} for task "${task.taskTitle}"`);

        await userModel.markReminderSent(task.taskId);
        await activityModel.record({ email: task.userEmail, eventType: 'notification.sent', message: `Reminder sent for “${task.taskTitle}”.`, metadata: { taskId: task.taskId, channels: ['email', ...(!smsResult.skipped ? ['sms'] : [])] } });
        logger.info(`Task "${task.taskTitle}" marked as email sent for user ${task.userEmail}`);
      } catch (emailError) {
        logger.error(`Failed to send email to ${task.userEmail} for task "${task.taskTitle}": ${emailError.message}`);
        await activityModel.record({ email: task.userEmail, level: 'error', eventType: 'notification.failed', message: `Reminder could not be sent for “${task.taskTitle}”.`, metadata: { taskId: task.taskId } });
      }
    }

    // logger.info(`Task notification check completed. [${timestamp}]`);
  } catch (error) {
    logger.error(`Error during task notification check: ${error.message}`);
  }
});

require('dotenv').config();
const schedule = require('node-schedule');
const path = require('path');
const userModel = require('../models/userModel');
const { getTasksWith12HoursLeft } = require('../models/emailModel');
const sendEmail = require('./emailSender');
const sendSMSMessage = require('./smsSender');
const logger = require('./logger'); // Import logger

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
    const tasksToNotify = await getTasksWith12HoursLeft();
    const users = await userModel.getUsers();

    for (const task of tasksToNotify) {
      const emailContent = `
        <h1>Reminder: Task Due Soon</h1>
        <p>Hi ${task.userName},</p>
        <p>Your task <strong>"${task.taskTitle}"</strong> is due on <strong>${task.taskDueDate}</strong>.</p>
        <p>Please make sure to complete it on time.</p>
      `;

      const smsContent = `
🚨 Remainder:      
Hi, ${task.userName},
your task ${task.taskTitle} is due on ${task.taskDueDate}. 
`;

      try {
        await sendEmail(task.userEmail, 'Task Due Reminder', emailContent);
        logger.info(`Email sent to ${task.userEmail} for task "${task.taskTitle}"`);


        // ✅ Properly update users and save
        const updatedUsers = users.map((user) => {
          if (user.email !== task.userEmail) return user;

          user.tasklists.forEach((tasklist) => {
            tasklist.tasks.forEach((t) => {
              if (t.id === task.taskId) {
                t.emailSent = true;
              }
            });
          });

          return user;
        });
        await sendSMSMessage(task.userPhone, process.env.TWILIO_PHONE_NUMBER, smsContent);
        logger.info(`SMS sent to ${task.userPhone} for task "${task.taskTitle}"`);

        await userModel.saveUsers(updatedUsers);
        logger.info(`Task "${task.taskTitle}" marked as email sent for user ${task.userEmail}`);
      } catch (emailError) {
        logger.error(`Failed to send email to ${task.userEmail} for task "${task.taskTitle}": ${emailError.message}`);
      }
    }

    // logger.info(`Task notification check completed. [${timestamp}]`);
  } catch (error) {
    logger.error(`Error during task notification check: ${error.message}`);
  }
});
const schedule = require('node-schedule');
const path = require('path');
const userModel = require('../models/userModel');
const { getTasksWith12HoursLeft } = require('../models/emailModel');
const sendEmail = require('./emailSender');

// 🕒 Schedule job to check for overdue tasks every minute
schedule.scheduleJob('* * * * *', async () => {
  console.log('Running overdue task check...', new Date());
  await userModel.checkOverdueTasksForAllUsers();
  console.log('Overdue tasks updated successfully.', new Date());
});

// 🕒 Schedule job to send reminder emails every minute (change to hourly in production)
schedule.scheduleJob('* * * * *', async () => {
  console.log('Checking tasks with 12 hours left...', new Date());

  const tasksToNotify = await getTasksWith12HoursLeft();
  const users = await userModel.getUsers();

  for (const task of tasksToNotify) {
    const emailContent = `
      <h1>Reminder: Task Due Soon</h1>
      <p>Hi ${task.userName},</p>
      <p>Your task <strong>"${task.taskTitle}"</strong> is due on <strong>${task.taskDueDate}</strong>.</p>
      <p>Please make sure to complete it on time.</p>
    `;

    try {
      await sendEmail(task.userEmail, 'Task Due Reminder', emailContent);
      console.log(`Email sent to ${task.userEmail} for task "${task.taskTitle}"`);

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

      await userModel.saveUsers(updatedUsers);

    } catch (error) {
      console.error(`Failed to send email to ${task.userEmail} for task "${task.taskTitle}":`, error);
    }
  }

  console.log('Task notification check completed.', new Date());
});

const schedule = require('node-schedule');
const { checkOverdueTasksForAllUsers } = require('../models/userModel');

// Schedule the job to run every minute
schedule.scheduleJob('* * * * *', async () => {
  console.log('Running overdue task check...',Date());
  await checkOverdueTasksForAllUsers();
  console.log('Overdue tasks updated successfully.',Date());
});
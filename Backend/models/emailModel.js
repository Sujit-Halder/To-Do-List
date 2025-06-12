const fs = require('fs');
const path = require('path');
const userModel = require('../models/userModel');


const getTasksWith12HoursLeft = async () => {
    const users = await userModel.getUsers();

    const now = new Date();
    const twelveHoursLater = new Date(now.getTime() + 8 * 60 * 60 * 1000);

    const tasksToNotify = [];

    users?.forEach((user) => {
        if (!Array.isArray(user.tasklists)) {
            console.warn(`User ${user.name} does not have valid tasklists.`);
            return;
        }

        user.tasklists.forEach((tasklist) => {
            if (!Array.isArray(tasklist.tasks)) {
                console.warn(`Tasklist ${tasklist.name} for user ${user.name} does not have valid tasks.`);
                return;
            }

            tasklist.tasks.forEach((task) => {
                const taskDueDate = new Date(task.date + 'T' + task.time);
                if (task.status === 'Completed' || task.emailSent === true) {
                    return;
                }
                if (task.emailNotification !== true) {
                    return;
                }
                if (!taskDueDate || isNaN(taskDueDate.getTime())) {
                    console.log(`Skipping task with invalid due date: ${task.title}`);
                    return;
                }
                if (taskDueDate > now && taskDueDate <= twelveHoursLater) {
                    tasksToNotify.push({
                        userEmail: user.email,
                        userName: user.name,
                        taskTitle: task.title,
                        taskDueDate: taskDueDate,
                        taskId: task.id,
                    });
                }
            });
        });
    });

    return tasksToNotify;
};

module.exports = { getTasksWith12HoursLeft };
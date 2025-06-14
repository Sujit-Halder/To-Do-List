const fs = require('fs');
const path = require('path');
const userModel = require('../models/userModel');
const logger = require('../utils/logger'); // Import logger

/**
 * Get tasks with 12 hours left for notification.
 * @returns {Array} List of tasks to notify.
 */
const getTasksWith12HoursLeft = async () => {
    try {
        const users = await userModel.getUsers();

        const now = new Date();
        const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000); // 12 hours later

        const tasksToNotify = [];

        users?.forEach((user) => {
            if (!Array.isArray(user.tasklists)) {
                logger.warn(`User ${user.name} does not have valid tasklists.`);
                return;
            }

            user.tasklists.forEach((tasklist) => {
                if (!Array.isArray(tasklist.tasks)) {
                    logger.warn(`Tasklist ${tasklist.name} for user ${user.name} does not have valid tasks.`);
                    return;
                }

                tasklist.tasks.forEach((task) => {
                    const taskDueDate = new Date(task.date + 'T' + task.time);

                    // Skip completed tasks or tasks with email already sent
                    if (task.status === 'Completed' || task.emailSent === true) {
                        // logger.info(`Skipping completed or already notified task: ${task.title}`);
                        return;
                    }

                    // Skip tasks without email notifications enabled
                    if (task.emailNotification !== true) {
                        // logger.info(`Skipping task without email notification: ${task.title}`);
                        return;
                    }

                    // Skip tasks with invalid due dates
                    if (!taskDueDate || isNaN(taskDueDate.getTime())) {
                        logger.warn(`Skipping task with invalid due date: ${task.title}`);
                        return;
                    }

                    // Add tasks due within the next 12 hours
                    if (taskDueDate > now && taskDueDate <= twelveHoursLater) {
                        tasksToNotify.push({
                            userEmail: user.email,
                            userName: user.name,
                            taskTitle: task.title,
                            taskDueDate: taskDueDate,
                            taskId: task.id,
                        });
                        logger.info(`Task "${task.title}" for user ${user.name} added to notification list.`);
                    }
                });
            });
        });

        // logger.info(`Found ${tasksToNotify.length} tasks to notify.`);
        return tasksToNotify;
    } catch (error) {
        logger.error(`Error while fetching tasks with 12 hours left: ${error.message}`);
        throw new Error('Failed to fetch tasks for notification.');
    }
};

module.exports = { getTasksWith12HoursLeft };
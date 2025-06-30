const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const { base64 } = require('../utils/generateTokens');
const logger = require('../utils/logger'); // Import logger

exports.updateImage = async (req, res) => {
    try {
        if (!req.body.image) {
            logger.warn('Update image failed: No image provided');
            return res.status(400).json({ message: 'No image provided' });
        }

        const success = await userModel.updateUserByEmail(req.user.email, { image: req.body.image });
        if (!success) {
            logger.warn(`Update image failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info(`User ${req.user.email} updated profile image`);
        return res.status(200).json({ message: 'Image updated successfully' });
    } catch (error) {
        logger.error(`Error during image update: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const success = await userModel.updateUserByEmail(req.user.email, { image: '' });
        if (!success) {
            logger.warn(`Delete image failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        logger.info(`User ${req.user.email} deleted profile image`);
        return res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        logger.error(`Error during image delete: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addTaskList = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            logger.warn('Add task list failed: Task list name is required');
            return res.status(400).json({ message: 'Task list name is required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            logger.warn(`Add task list failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const otherTaskIndex = user.tasklists.findIndex(tasklist => tasklist.name === "Other Task");

        let updatedTaskLists;
        if (otherTaskIndex !== -1) {
            updatedTaskLists = [
                ...user.tasklists.slice(0, otherTaskIndex),
                { name, tasks: [] },
                ...user.tasklists.slice(otherTaskIndex)
            ];
        } else {
            updatedTaskLists = [...user.tasklists, { name, tasks: [] }];
        }

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: updatedTaskLists });
        if (!success) {
            logger.error(`Add task list failed: Could not update user - ${req.user.email}`);
            return res.status(500).json({ message: 'Failed to add task list' });
        }

        logger.info(`User ${req.user.email} added task list: ${name}`);
        return res.status(200).json({ tasklists: updatedTaskLists });
    } catch (error) {
        logger.error(`Error during adding task list: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.editTaskList = async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            logger.warn('Edit task list failed: Both old and new task list names are required');
            return res.status(400).json({ message: 'Both old and new task list names are required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            logger.warn(`Edit task list failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedTaskLists = user.tasklists.map(tasklist =>
            tasklist.name === oldName ? { ...tasklist, name: newName } : tasklist
        );

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: updatedTaskLists });
        if (!success) {
            logger.error(`Edit task list failed: Could not update user - ${req.user.email}`);
            return res.status(500).json({ message: 'Failed to edit task list' });
        }

        logger.info(`User ${req.user.email} edited task list: ${oldName} to ${newName}`);
        return res.status(200).json({ tasklists: updatedTaskLists });
    } catch (error) {
        logger.error(`Error during task list editing: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteTaskList = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            logger.warn('Delete task list failed: Task list name is required');
            return res.status(400).json({ message: 'Task list name is required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            logger.warn(`Delete task list failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedTaskLists = user.tasklists.filter(tasklist => tasklist.name !== name);

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: updatedTaskLists });
        if (!success) {
            logger.error(`Delete task list failed: Could not update user - ${req.user.email}`);
            return res.status(500).json({ message: 'Failed to delete task list' });
        }

        logger.info(`User ${req.user.email} deleted task list: ${name}`);
        return res.status(200).json({ tasklists: updatedTaskLists });
    } catch (error) {
        logger.error(`Error during task list deletion: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { tasklistName, task } = req.body;
        if (!tasklistName || !task) {
            logger.warn('Create task failed: Task list name and task data are required');
            return res.status(400).json({ message: 'Task list name and task data are required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            logger.warn(`Create task failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        const tasklistIndex = user.tasklists.findIndex(tl => tl.name === tasklistName);
        const otherTaskIndex = user.tasklists.findIndex(tl => tl.name === "Other Task");

        const newTask = {
            id: uuidv4(),
            ...task,
            emailSent: task.emailNotification === true ? false : undefined
        };

        if (tasklistIndex !== -1) {
            user.tasklists[tasklistIndex].tasks.push(newTask);
        } else {
            const newTasklist = { name: tasklistName, tasks: [newTask] };

            if (otherTaskIndex !== -1) {
                user.tasklists = [
                    ...user.tasklists.slice(0, otherTaskIndex),
                    newTasklist,
                    ...user.tasklists.slice(otherTaskIndex)
                ];
            } else {
                user.tasklists.push(newTasklist);
            }
        }

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
        if (!success) {
            logger.error(`Create task failed: Could not update user - ${req.user.email}`);
            return res.status(500).json({ message: 'Failed to create task' });
        }

        logger.info(`User ${req.user.email} created a task in task list: ${tasklistName}`);
        return res.status(200).json({ tasklists: user.tasklists });
    } catch (error) {
        logger.error(`Error during task creation: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.editTask = async (req, res) => {
    try {
        const { updatedTask } = req.body;
        if (!updatedTask || !updatedTask.id) {
            logger.warn('Edit task failed: Task data with a valid ID is required');
            return res.status(400).json({ message: 'Task data with a valid ID is required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            logger.warn(`Edit task failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        let taskFound = false;

        for (const tasklist of user.tasklists) {
            const task = tasklist.tasks.find(t => t.id === updatedTask.id);
            if (task) {
                Object.assign(task, updatedTask, { modificationTime: new Date().toISOString() });
                taskFound = true;
                break;
            }
        }

        if (!taskFound) {
            logger.warn(`Edit task failed: Task not found - ${updatedTask.id}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
        if (!success) {
            logger.error(`Edit task failed: Could not update user - ${req.user.email}`);
            return res.status(500).json({ message: 'Failed to edit task' });
        }

        logger.info(`User ${req.user.email} edited task: ${updatedTask.id}`);
        return res.status(200).json({ tasklists: user.tasklists });
    } catch (error) {
        logger.error(`Error during task editing: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        if (!taskId) {
            logger.warn('Delete task failed: Task ID is required');
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            logger.warn(`Delete task failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        let taskFound = false;

        for (const tasklist of user.tasklists) {
            const initialTaskCount = tasklist.tasks.length;
            tasklist.tasks = tasklist.tasks.filter(t => t.id !== taskId);
            if (tasklist.tasks.length < initialTaskCount) {
                taskFound = true;
                break;
            }
        }

        if (!taskFound) {
            logger.warn(`Delete task failed: Task not found - ${taskId}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
        if (!success) {
            logger.error(`Delete task failed: Could not update user - ${req.user.email}`);
            return res.status(500).json({ message: 'Failed to delete task' });
        }

        logger.info(`User ${req.user.email} deleted task: ${taskId}`);
        return res.status(200).json({ tasklists: user.tasklists });
    } catch (error) {
        logger.error(`Error during task deletion: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.markTaskAsComplete = async (req, res) => {
    try {
        const { taskId } = req.body;
        if (!taskId) {
            logger.warn('Mark task as complete failed: Task ID is required');
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) {
            logger.warn(`Mark task as complete failed: User not found - ${req.user.email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        let taskFound = false;

        for (const tasklist of user.tasklists) {
            const task = tasklist.tasks.find(t => t.id === taskId);
            if (task) {
                if (task.status !== 'Completed') {
                    task.status = 'Completed';
                    task.completionTime = new Date().toISOString();
                } else {
                    task.status = 'Not Started';
                    task.completionTime = '';
                }
                taskFound = true;
                break;
            }
        }

        if (!taskFound) {
            logger.warn(`Mark task as complete failed: Task not found - ${taskId}`);
            return res.status(404).json({ message: 'Task not found' });
        }

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
        if (!success) {
            logger.error(`Mark task as complete failed: Could not update user - ${req.user.email}`);
            return res.status(500).json({ message: 'Failed to mark task as complete' });
        }

        logger.info(`User ${req.user.email} marked task as complete: ${taskId}`);
        return res.status(200).json({ tasklists: user.tasklists });
    } catch (error) {
        logger.error(`Error during marking task as complete: ${error.message}`);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
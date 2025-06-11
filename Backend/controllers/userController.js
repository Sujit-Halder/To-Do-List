const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const { base64 } = require('../utils/generateTokens');

exports.updateImage = async (req, res) => {
    try {
        if (!req.body.image) {
            return res.status(400).json({ message: 'No image provided' });
        }

        const success = userModel.updateUserByEmail(req.user.email, { image: req.body.image });
        if (!success) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ message: 'Image updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const success = userModel.updateUserByEmail(req.user.email, { image: base64('../data/no-photo.png') });
        if (!success) return res.status(404).json({ message: 'User not found' });
        return res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addTaskList = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Task list name is required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find the index of "Other Task"
        const otherTaskIndex = user.tasklists.findIndex(tasklist => tasklist.name === "Other Task");

        let updatedTaskLists;
        if (otherTaskIndex !== -1) {
            // Insert the new task list before "Other Task"
            updatedTaskLists = [
                ...user.tasklists.slice(0, otherTaskIndex), // Default tasks
                { name, tasks: [] }, // New task list
                ...user.tasklists.slice(otherTaskIndex) // Remaining tasks including "Other Task"
            ];
        } else {
            // Add the new task list at the end if "Other Task" is not found
            updatedTaskLists = [...user.tasklists, { name, tasks: [] }];
        }

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: updatedTaskLists });
        if (!success) return res.status(500).json({ message: 'Failed to add task list' });

        return res.status(200).json({ tasklists: updatedTaskLists });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.editTaskList = async (req, res) => {
    try {
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
            return res.status(400).json({ message: 'Both old and new task list names are required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updatedTaskLists = user.tasklists.map(tasklist =>
            tasklist.name === oldName ? { ...tasklist, name: newName } : tasklist
        );
        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: updatedTaskLists });
        if (!success) return res.status(500).json({ message: 'Failed to edit task list' });

        return res.status(200).json({ tasklists: updatedTaskLists });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteTaskList = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Task list name is required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updatedTaskLists = user.tasklists.filter(tasklist => tasklist.name !== name);
        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: updatedTaskLists });
        if (!success) return res.status(500).json({ message: 'Failed to delete task list' });

        return res.status(200).json({ tasklists: updatedTaskLists });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createTask = async (req, res) => {
    try {
        const { tasklistName, task } = req.body;
        const user = await userModel.findByEmail(req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const tasklistIndex = user.tasklists.findIndex(tl => tl.name === tasklistName);
        const otherTaskIndex = user.tasklists.findIndex(tl => tl.name === "Other Task");

        const newTask = {
            id: uuidv4(), // Generate a unique ID for the task 
            ...task,
            emailSent: task.emailNotification === true ? false : undefined
        };

        if (tasklistIndex !== -1) {
            // Add task to existing task list
            user.tasklists[tasklistIndex].tasks.push(newTask);
        } else {
            // Create a new task list with the task
            const newTasklist = { name: tasklistName, tasks: [newTask] };

            if (otherTaskIndex !== -1) {
                // Insert the new tasklist before "Other Task"
                user.tasklists = [
                    ...user.tasklists.slice(0, otherTaskIndex), // Tasklists before "Other Task"
                    newTasklist, // New tasklist
                    ...user.tasklists.slice(otherTaskIndex), // "Other Task" and remaining tasklists
                ];
            } else {
                // Add the new tasklist at the end if "Other Task" is not found
                user.tasklists.push(newTasklist);
            }
        }

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
        if (!success) return res.status(500).json({ message: 'Failed to create task' });

        res.status(200).json({ tasklists: user.tasklists });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.editTask = async (req, res) => {
    try {
        const {  updatedTask } = req.body;
        const user = await userModel.findByEmail(req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let taskFound = false;

        for (const tasklist of user.tasklists) {
            const task = tasklist.tasks.find(t => t.id === updatedTask.id);
            if (task) {
                Object.assign(task, updatedTask, { modificationTime: new Date().toISOString() });
                taskFound = true;
                break;
            }
        }

        if (!taskFound) return res.status(404).json({ message: 'Task not found' });

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
        if (!success) return res.status(500).json({ message: 'Failed to edit task' });

        res.status(200).json({ tasklists: user.tasklists });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.body;

        if (!taskId) {
            return res.status(400).json({ message: 'Task ID is required' });
        }

        const user = await userModel.findByEmail(req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let taskFound = false;

        for (const tasklist of user.tasklists) {
            const initialTaskCount = tasklist.tasks.length;
            tasklist.tasks = tasklist.tasks.filter(t => t.id !== taskId);
            if (tasklist.tasks.length < initialTaskCount) {
                taskFound = true;
                break;
            }
        }

        if (!taskFound) return res.status(404).json({ message: 'Task not found' });

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
        if (!success) return res.status(500).json({ message: 'Failed to delete task' });

        res.status(200).json({ tasklists: user.tasklists });
    } catch (error) {
        console.error('Error deleting task:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.markTaskAsComplete = async (req, res) => {
    try {
        const { taskId } = req.body;
        const user = await userModel.findByEmail(req.user.email);
        if (!user) return res.status(404).json({ message: 'User not found' });

        let taskFound = false;

        for (const tasklist of user.tasklists) {
            const task = tasklist.tasks.find(t => t.id === taskId);
            if (task) {
               if(task.status !== 'Completed') {
                    task.status = 'Completed';
                    task.completionTime = new Date().toISOString(); // Set completion time
                }
                else if(task.status === 'Completed') {
                    task.status = 'Not Started'; // Toggle back to Not Started
                    task.completionTime = ''; // Clear completion time
                }
                taskFound = true;
                break;
            }
        }

        if (!taskFound) return res.status(404).json({ message: 'Task not found' });

        const success = await userModel.updateUserByEmail(req.user.email, { tasklists: user.tasklists });
        if (!success) return res.status(500).json({ message: 'Failed to mark task as complete' });

        res.status(200).json({ tasklists: user.tasklists });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
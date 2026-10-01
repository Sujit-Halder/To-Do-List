const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const logger = require('../utils/logger');
const activityModel = require('../models/activityModel');

const respondError = (res, error, context, email, eventType = 'system.error') => {
  logger.error(`${context}: ${error.message}`);
  activityModel.record({ email, level: 'error', eventType, message: context }).catch(() => {});
  if (error.code === 'ERR_SQLITE_CONSTRAINT_UNIQUE') {
    return res.status(409).json({ message: 'That name is already in use. Please choose another one.' });
  }
  return res.status(500).json({ message: 'We could not save your changes. Please try again.' });
};

const cleanName = (value) => typeof value === 'string' ? value.trim() : '';

exports.updateImage = async (req, res) => {
  try {
    if (!req.body.image) return res.status(400).json({ message: 'Choose an image before uploading.' });
    const success = await userModel.updateImage(req.user.email, req.body.image);
    if (success) await activityModel.record({ email: req.user.email, eventType: 'profile.image_updated', message: 'Profile image updated.' });
    return success ? res.json({ message: 'Profile image updated.' }) : res.status(404).json({ message: 'Account not found.' });
  } catch (error) { return respondError(res, error, 'Profile image update failed', req.user.email, 'profile.image_error'); }
};

exports.deleteImage = async (req, res) => {
  try {
    const success = await userModel.updateImage(req.user.email, '');
    if (success) await activityModel.record({ email: req.user.email, eventType: 'profile.image_removed', message: 'Profile image removed.' });
    return success ? res.json({ message: 'Profile image removed.' }) : res.status(404).json({ message: 'Account not found.' });
  } catch (error) { return respondError(res, error, 'Profile image deletion failed', req.user.email, 'profile.image_error'); }
};

exports.addTaskList = async (req, res) => {
  const name = cleanName(req.body.name);
  if (!name) return res.status(400).json({ message: 'Enter a name for the task list.' });
  if (name.length > 60) return res.status(400).json({ message: 'Task list names must be 60 characters or fewer.' });
  try {
    const tasklists = await userModel.addTaskList(req.user.email, name);
    if (tasklists) await activityModel.record({ email: req.user.email, eventType: 'task_list.created', message: `Task list “${name}” created.`, metadata: { taskList: name } });
    return tasklists ? res.json({ message: `“${name}” was created.`, tasklists }) : res.status(404).json({ message: 'Account not found.' });
  } catch (error) { return respondError(res, error, 'Task list creation failed', req.user.email, 'task_list.error'); }
};

exports.editTaskList = async (req, res) => {
  const oldName = cleanName(req.body.oldName);
  const newName = cleanName(req.body.newName);
  if (!oldName || !newName) return res.status(400).json({ message: 'Provide both the current and new task list names.' });
  try {
    const tasklists = await userModel.renameTaskList(req.user.email, oldName, newName);
    if (tasklists) await activityModel.record({ email: req.user.email, eventType: 'task_list.renamed', message: `Task list “${oldName}” renamed to “${newName}”.`, metadata: { oldName, newName } });
    return tasklists ? res.json({ message: `Task list renamed to “${newName}”.`, tasklists }) : res.status(404).json({ message: 'Task list not found.' });
  } catch (error) { return respondError(res, error, 'Task list rename failed', req.user.email, 'task_list.error'); }
};

exports.deleteTaskList = async (req, res) => {
  const name = cleanName(req.body.name);
  if (!name) return res.status(400).json({ message: 'Choose a task list to delete.' });
  try {
    const tasklists = await userModel.deleteTaskList(req.user.email, name);
    if (tasklists) await activityModel.record({ email: req.user.email, level: 'warning', eventType: 'task_list.deleted', message: `Task list “${name}” and its tasks deleted.`, metadata: { taskList: name } });
    return tasklists ? res.json({ message: `“${name}” and its tasks were deleted.`, tasklists }) : res.status(404).json({ message: 'Task list not found.' });
  } catch (error) { return respondError(res, error, 'Task list deletion failed', req.user.email, 'task_list.error'); }
};

exports.createTask = async (req, res) => {
  const tasklistName = cleanName(req.body.tasklistName);
  const task = req.body.task;
  if (!tasklistName || !task?.title || !task?.date || !task?.time) return res.status(400).json({ message: 'Title, task list, reminder date, and reminder time are required.' });
  try {
    const tasklists = await userModel.createTask(req.user.email, tasklistName, { ...task, id: uuidv4() });
    if (tasklists) await activityModel.record({ email: req.user.email, eventType: 'task.created', message: `Task “${task.title.trim()}” created in “${tasklistName}”.`, metadata: { taskList: tasklistName, title: task.title.trim() } });
    return tasklists ? res.json({ message: `“${task.title.trim()}” was added.`, tasklists }) : res.status(404).json({ message: 'Account not found.' });
  } catch (error) { return respondError(res, error, 'Task creation failed', req.user.email, 'task.error'); }
};

exports.editTask = async (req, res) => {
  const task = req.body.updatedTask;
  if (!task?.id || !task?.title || !task?.date || !task?.time) return res.status(400).json({ message: 'Complete all required task fields before saving.' });
  try {
    const tasklists = await userModel.updateTask(req.user.email, task);
    if (tasklists) await activityModel.record({ email: req.user.email, eventType: 'task.updated', message: `Task “${task.title.trim()}” updated.`, metadata: { taskId: task.id, title: task.title.trim() } });
    return tasklists ? res.json({ message: 'Task updated.', tasklists }) : res.status(404).json({ message: 'Task not found.' });
  } catch (error) { return respondError(res, error, 'Task update failed', req.user.email, 'task.error'); }
};

exports.deleteTask = async (req, res) => {
  if (!req.body.taskId) return res.status(400).json({ message: 'Choose a task to delete.' });
  try {
    const tasklists = await userModel.deleteTask(req.user.email, req.body.taskId);
    if (tasklists) await activityModel.record({ email: req.user.email, level: 'warning', eventType: 'task.deleted', message: 'Task deleted.', metadata: { taskId: req.body.taskId } });
    return tasklists ? res.json({ message: 'Task deleted.', tasklists }) : res.status(404).json({ message: 'Task not found.' });
  } catch (error) { return respondError(res, error, 'Task deletion failed', req.user.email, 'task.error'); }
};

exports.markTaskAsComplete = async (req, res) => {
  if (!req.body.taskId) return res.status(400).json({ message: 'Choose a task to update.' });
  try {
    const tasklists = await userModel.toggleTaskComplete(req.user.email, req.body.taskId);
    if (tasklists) await activityModel.record({ email: req.user.email, eventType: 'task.status_updated', message: 'Task completion status updated.', metadata: { taskId: req.body.taskId } });
    return tasklists ? res.json({ message: 'Task status updated.', tasklists }) : res.status(404).json({ message: 'Task not found.' });
  } catch (error) { return respondError(res, error, 'Task status update failed', req.user.email, 'task.error'); }
};

exports.getActivity = async (req, res) => {
  try {
    const activity = await activityModel.listForUser(req.user.email, req.query);
    return res.json(activity);
  } catch (error) {
    return respondError(res, error, 'Activity log could not be loaded', req.user.email, 'activity.read_error');
  }
};

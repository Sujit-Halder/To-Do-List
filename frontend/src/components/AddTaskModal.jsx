import React, { useState, useEffect } from 'react';
import { notify } from '../utils/notifications';

const AddTaskModal = ({ onClose, onSubmit, initialData }) => {
  const [form, setForm] = useState({
    title: '',
    status: 'Not Started',
    time: '',
    date: '',
    priority: 'Moderate',
    imageUrl: 'no-photo.png',
    emailNotification: false,
    creationTime: '',
    modificationTime: '',
    completionTime: '',
  });

  useEffect(() => {
    if (initialData) {
      const updatedForm = {
        ...initialData,
        date: initialData.date || "",
        time: initialData.time || "",
      };
      setForm(updatedForm);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const currentDateTime = new Date();
    const reminderDateTime = new Date(`${form.date}T${form.time}`);

    // Validate reminder time
    const timeDifference = (reminderDateTime - currentDateTime) / (1000 * 60);
    if (!initialData && timeDifference < 10) {
      form.time = '';
      form.date = '';
      notify('Reminder time must be at least 10 minutes in the future.', 'warning');
      return;
    }

    if (initialData && timeDifference < 10) {
      notify('Reminder time must be at least 10 minutes in the future.', 'warning');
      return;
    }

    // Validate email notifications
    if (form.emailNotification && timeDifference < 5) {
      form.emailNotification = false;
      notify('Email reminders require a task time at least one hour in the future.', 'warning');
      return;
    }

    // Add creation and modification times
    const creationTime = currentDateTime.toISOString();
    const modificationTime = creationTime;

    const updatedForm = {
      ...form,
      creationTime,
      modificationTime,
      completionTime: '',
    };

    initialData ? onSubmit({ ...form, emailSent: false, modificationTime }) : onSubmit(updatedForm);
    onClose();
  };

  const CompleteEditBlock = () => {
    const currentDateTime = new Date();
    const completionDateTime = new Date(form?.completionTime);
    const timeDifference = (currentDateTime - completionDateTime) / (1000 * 60);
    if (timeDifference > 3 * 60) {
      notify('This completed task can no longer be edited.', 'warning');
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form onSubmit={handleSubmit} className="surface-card max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-400">Task details</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{!initialData ? 'Add new task' : 'Edit task'}</h2>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Title</label>
          <input
            name="title"
            type="text"
            placeholder="Title"
            title="Use a short, clear action for the task title"
            className="field-control"
            value={form.title}
            onChange={handleChange}
            disabled={initialData && (form.status === 'Completed' || form.status === 'Overdue' || form.status === 'In Progress')}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Status</label>
          <select
            name="status"
            className="field-control"
            value={form.status}
            title="Track the current state of this task"
            onChange={handleChange}
            disabled={initialData && (CompleteEditBlock() || form.status === 'Overdue')}
          >
            <option value="Not Started" hidden={form.status === 'Not Started'}>Not Started</option>
            <option value="In Progress" hidden={form.status === 'In Progress' || !initialData}>In Progress</option>
            <option value="Completed" hidden={form.status === 'Completed' || !initialData}>Completed</option>
            {/* <option value="Overdue" hidden={form.status === 'Overdue' || !initialData }>Overdue</option> */}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Remainder Date</label>
          <input
            name="date"
            type="date"
            className="field-control"
            value={form.date}
            title="Choose the date when this task is due"
            onChange={handleChange}
            disabled={initialData && form.status === 'Completed'}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Remainder Time</label>
          <input
            name="time"
            type="time"
            className="field-control"
            value={form.time}
            title="Choose the time when this task is due"
            onChange={handleChange}
            disabled={initialData && form.status === 'Completed'}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            className="field-control"
            value={form.priority}
            title="Set how important this task is"
            onChange={handleChange}
            disabled={initialData && (form.status === 'Overdue' || form.status === 'Completed')}
          >
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Any Related Image (optional)</label>
          <input
            name="imageUrl"
            type="text"
            placeholder="Image URL"
            title="Optionally add a public image URL related to this task"
            className="field-control"
            value={form.imageUrl}
            onChange={handleChange}
            disabled={initialData && (form.status === 'Overdue' || form.status === 'Completed')}
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            name="emailNotification"
            type="checkbox"
            checked={form.emailNotification}
            title="Send an email reminder before this task is due"
            onChange={handleChange}
            disabled={initialData && (form.status === 'Overdue' || form.status === 'Completed')}
          />
          <label htmlFor="emailNotification" className="text-gray-700">
            Allow Email Notifications
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">
            Cancel
          </button>
          <button type="submit" className="button-primary">
            {!initialData ? 'Add Task' : 'Update Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskModal;

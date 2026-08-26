import React, { useState, useEffect } from 'react';

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
      alert('Reminder time must be at least 10 minutes in the future.');
      return;
    }

    if (initialData && timeDifference < 10) {
      alert('Reminder time must be at least 10 minutes in the future.');
      return;
    }

    // Validate email notifications
    if (form.emailNotification && timeDifference < 5) {
      form.emailNotification = false;
      alert('Email notifications are allowed only for tasks with a reminder time at least 1 hours in the future.');
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
      alert('Completion time is One Week long.Now you can not edit this task');
      return true;
    } else {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">
        <h2 className="text-xl font-semibold text-center">{!initialData ? 'Add New Task' : 'Edit Task'}</h2>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Title</label>
          <input
            name="title"
            type="text"
            placeholder="Title"
            className="w-full p-2 border rounded bg-white text-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-inner"
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
            className="w-full p-2 border rounded bg-white text-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-inner"
            value={form.status}
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
            className="w-full p-2 border rounded bg-white text-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-inner"
            value={form.date}
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
            className="w-full p-2 border rounded bg-white text-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-inner"
            value={form.time}
            onChange={handleChange}
            disabled={initialData && form.status === 'Completed'}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Priority</label>
          <select
            name="priority"
            className="w-full p-2 border rounded bg-white text-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-inner"
            value={form.priority}
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
            className="w-full p-2 border rounded bg-white text-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-inner"
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
            onChange={handleChange}
            disabled={initialData && (form.status === 'Overdue' || form.status === 'Completed')}
          />
          <label htmlFor="emailNotification" className="text-gray-700">
            Allow Email Notifications
          </label>
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={onClose} className="text-gray-500">
            Cancel
          </button>
          <button type="submit" className="bg-red-400 text-white px-4 py-2 rounded">
            {!initialData ? 'Add Task' : 'Update Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskModal;
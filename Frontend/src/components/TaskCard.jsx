import React, { useState } from 'react';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';


const TaskCard = ({ taskData, tasklistName, onEdit, onDelete, onToggleComplete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      console.error(`Invalid date: ${date}`);
      return date;
    }

    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString('en-US', { month: 'long' });
    const year = parsedDate.getFullYear();

    // Determine the suffix for the day (1st, 2nd, 3rd, etc.)
    const suffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
          ? 'nd'
          : day % 10 === 3 && day !== 13
            ? 'rd'
            : 'th';

    return `${day}${suffix} ${month} ${year}`;
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  // Combine date and time into a single human-readable format
  const formatDateTime = (dateTime) => {
    const parsedDateTime = new Date(dateTime);

    if (isNaN(parsedDateTime)) {
      console.error(`Invalid dateTime: ${dateTime}`);
      return dateTime;
    }

    const formattedDate = formatDate(parsedDateTime);
    const formattedTime = parsedDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    return `${formattedDate}, ${formattedTime}`;
  };
  const CompleteEditBlock = () => {
    const currentDateTime = new Date();
    const completionDateTime = new Date(taskData?.completionTime);
    const timeDifference = (currentDateTime - completionDateTime) / (1000 * 60);
    if (timeDifference > 3 * 60) {
      // alert('Completion time is One Week long.Now you can not edit this task');
      return true;
    } else {
      return false;
    }
  };

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-lg flex justify-between items-center relative transition-transform duration-300 ${isHovered ? 'scale-105 shadow-2xl' : 'scale-100'
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col justify-between space-y-2">
        <h3
          className={`font-bold text-lg ${taskData.status === 'Completed' ? 'text-green-600 line-through' : 'text-gray-800'
            }`}
        >
          {taskData.title}
        </h3>
        {taskData.date && <p className="text-sm text-gray-600">📅 {formatDate(taskData.date)}</p>}
        {taskData.time && <p className="text-sm text-gray-600">⏳ {formatTime(taskData.time)}</p>}
        <p className="text-sm text-gray-600">
          🔥 Priority: <span className="font-medium">{taskData.priority || '--'}</span> | ✅ Status:{' '}
          <span className="font-medium">{taskData.status}</span>  |  📧 Email Notification:{' '}
          <span className="text-sm text-gray-600">{taskData.emailNotification ? ' 🔔' : ' 🔕'}</span>
        </p>
        <p className="text-xs text-gray-400">📅 Created on: {formatDateTime(taskData.creationTime)}</p>
        <p className="text-xs text-gray-400">📅 Last Modified on: {formatDateTime(taskData.modificationTime)}</p>
        {taskData.completionTime && <p className="text-xs text-gray-400">📅 Task Completed on: {formatDateTime(taskData.completionTime)}</p>}
        <button
          onClick={onToggleComplete}
          className={`mt-2 text-sm flex items-center gap-2 px-4 py-2 rounded-full font-medium  transition-transform duration-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-inner ${taskData.status === 'Completed'
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-600'
            }`}
          title="It will mark the task as completed or uncompleted"
          aria-label="Toggle Task Completion"
          disabled={taskData.status === 'Overdue' || CompleteEditBlock()}
        >
          <FaCheck className="text-white" />
          {taskData.status === 'Completed' ? 'Mark as Uncompleted' : 'Mark as Completed'}

        </button>
      </div>

      {taskData.imageUrl && (
        <img
          src={taskData.imageUrl}
          alt={taskData.title}
          className="w-24 h-24 rounded-xl object-cover border border-gray-200 shadow-sm ml-4"
        />
      )}

      {isHovered && taskData.status !== 'Completed' && (
        <div className="absolute top-3 right-8 flex space-x-2 opacity-100 transition-opacity duration-300">
          <button
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md transition-transform duration-300 hover:scale-110"
            onClick={() => {
              onEdit(taskData);
            }}
            aria-label="Edit Task"
            title="Edit Task"
          >
            <FaEdit />
          </button>
          {taskData.status !== 'Overdue' && (
            <button
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-transform duration-300 hover:scale-110"
              onClick={() => {
                onDelete(taskData.id);
              }}
              aria-label="Delete Task"
              title="Delete Task"
            >
              <FaTrash />
            </button>
          )}
        </div>
      )}
      {tasklistName && (
        <div className="absolute bottom-3 right-8">
          <span className="text-xl font-medium text-red-500">#{tasklistName}</span>
        </div>
      )

      }
    </div>
  );
};

export default TaskCard;
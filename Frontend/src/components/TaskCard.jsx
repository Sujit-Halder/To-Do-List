import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck } from 'react-icons/fa';

const TaskCard = ({ taskData, tasklistName, onEdit, onDelete, onToggleComplete }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect if the device is a touch device
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  const handleHover = (state) => {
    if (!isTouchDevice) {
      setIsHovered(state);
    }
  };

  const formatDate = (date) => {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate)) {
      console.error(`Invalid date: ${date}`);
      return date;
    }

    const day = parsedDate.getDate();
    const month = parsedDate.toLocaleString('en-US', { month: 'long' });
    const year = parsedDate.getFullYear();

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
      return true;
    } else {
      return false;
    }
  };

  return (
    <article
      className="interactive-card group relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition sm:flex-row sm:items-start"
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onClick={() => isTouchDevice && setIsHovered(!isHovered)} // Toggle hover state on touch devices
    >
      <div className="min-w-0 flex-1 space-y-2">
        <h3
          className={`pr-20 text-base font-semibold leading-snug ${taskData.status === 'Completed' ? 'text-emerald-600 line-through' : 'text-slate-800'
            }`}
        >
          {taskData.title}
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          {taskData.date && <span className="rounded-lg bg-slate-100 px-2.5 py-1">📅 {formatDate(taskData.date)}</span>}
          {taskData.time && <span className="rounded-lg bg-slate-100 px-2.5 py-1">⏳ {formatTime(taskData.time)}</span>}
          <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-orange-700">{taskData.priority || '--'} priority</span>
          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700">{taskData.status}</span>
          {taskData.emailNotification && <span className="rounded-lg bg-red-50 px-2.5 py-1 text-red-600">🔔 Reminder on</span>}
        </div>
        <p className="text-xs text-slate-400">Created {formatDateTime(taskData.creationTime)} · Updated {formatDateTime(taskData.modificationTime)}</p>
        {taskData.completionTime && (
          <p className="text-xs text-emerald-600">Completed {formatDateTime(taskData.completionTime)}</p>
        )}
        <button
          onClick={onToggleComplete}
          className={`mt-1 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${taskData.status === 'Completed'
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
          title="It will mark the task as completed or uncompleted"
          aria-label="Toggle Task Completion"
          disabled={taskData.status === 'Overdue' || CompleteEditBlock()}
        >
          <FaCheck />
          {taskData.status === 'Completed' ? 'Mark as Uncompleted' : 'Mark as Completed'}
        </button>
      </div>

      {taskData.imageUrl && (
        <img
          src={taskData.imageUrl}
          alt={taskData.title}
          className="h-24 w-full rounded-xl border border-slate-200 object-cover sm:w-24 sm:shrink-0"
        />
      )}

      {taskData.status !== 'Completed' && (
        <div className="absolute right-3 top-3 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100"
            onClick={() => onEdit(taskData)}
            aria-label="Edit Task"
            title="Edit Task"
          >
            <FaEdit />
          </button>
          {taskData.status !== 'Overdue' && (
            <button
              className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"
              onClick={() => onDelete(taskData.id)}
              aria-label="Delete Task"
              title="Delete Task"
            >
              <FaTrash />
            </button>
          )}
        </div>
      )}
      {tasklistName && (
        <div className="absolute bottom-3 right-3">
          <span className="text-xs font-semibold text-red-400">#{tasklistName}</span>
        </div>
      )}
    </article>
  );
};

export default TaskCard;

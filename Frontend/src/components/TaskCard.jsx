import React from 'react';

const TaskCard = ({ title, time, date, priority, status, imageUrl }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md flex justify-between">
      <div>
        <h3 className="font-semibold text-md">{title}</h3>
        {time && <p className="text-sm">Time: {time}</p>}
        <p className="text-sm">Priority: {priority || '--'} | Status: <span className="font-medium">{status}</span></p>
        <p className="text-sm text-gray-400">Created on: {date}</p>
      </div>
      {imageUrl && <img src={imageUrl} alt={title} className="w-20 h-20 rounded-xl object-cover" />}
    </div>
  );
};

export default TaskCard;
import React from 'react';

const colorClasses = {
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  };
  
  const Progress = ({ title, percent, color }) => {
    const colorClass = colorClasses[color] || 'bg-gray-500'; 
  
    return (
      <div>
        <div className="flex justify-between text-sm font-medium mb-1">
          <span>{title}</span>
          <span>{percent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${colorClass}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    );
  };

  export default Progress;
  
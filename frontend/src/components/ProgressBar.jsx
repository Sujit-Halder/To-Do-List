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
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-semibold text-slate-600">
        <span>{title}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${Math.min(100, Math.max(0, Number(percent) || 0))}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Progress;

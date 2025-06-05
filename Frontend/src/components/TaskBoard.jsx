import React from 'react';
import TaskCard from './TaskCard';

const TaskBoard = ({user}) => {
  return (
    <div className="h-screen flex flex-col p-6 overflow-hidden">
      {/* Sticky Greeting Header */}
      <h1 className="text-4xl font-bold mb-4 shrink-0 sticky top-0 bg-white z-20">
        Welcome back, <span className="text-red-400">{user?.name}</span> 👋
      </h1>

      {/* Main Grid Area */}
      <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* To-Do Section */}
        <section className="col-span-2 bg-white shadow-xl rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 sticky top-0 bg-white z-10 shadow-sm rounded-t-xl">
            <h2 className="text-lg font-semibold">To-Do</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <TaskCard status="Not Started" title="Party" time="6 PM" date="20/06/2023" priority="Moderate" imageUrl="https://via.placeholder.com/100" />
            <TaskCard status="In Progress" title="Landing Page Design" time="4 PM" date="20/06/2023" priority="Moderate" imageUrl="https://via.placeholder.com/100" />
            <TaskCard status="Not Started" title="Party" time="6 PM" date="20/06/2023" priority="Moderate" imageUrl="https://via.placeholder.com/100" />
            <TaskCard status="In Progress" title="Landing Page Design" time="4 PM" date="20/06/2023" priority="Moderate" imageUrl="https://via.placeholder.com/100" />
            <TaskCard status="Not Started" title="Party" time="6 PM" date="20/06/2023" priority="Moderate" imageUrl="https://via.placeholder.com/100" />
            <TaskCard status="In Progress" title="Landing Page Design" time="4 PM" date="20/06/2023" priority="Moderate" imageUrl="https://via.placeholder.com/100" />
            <TaskCard status="Not Started" title="Party" time="6 PM" date="20/06/2023" priority="Moderate" imageUrl="https://via.placeholder.com/100" />
            <TaskCard status="In Progress" title="Landing Page Design" time="4 PM" date="20/06/2023" priority="Moderate" imageUrl="https://via.placeholder.com/100" />
            {/* More TaskCards... */}
          </div>
        </section>

        {/* Right Column */}
        <div className="flex flex-col gap-6 overflow-hidden">
          {/* Task Status – Not Scrollable */}
          <section className="bg-white shadow-xl rounded-xl p-4 shrink-0">
            <h2 className="text-lg font-semibold mb-4">Task Status</h2>
            <Progress title="Completed" percent={84} color="green" />
            <Progress title="In Progress" percent={46} color="blue" />
            <Progress title="Not Started" percent={13} color="red" />
          </section>

          {/* Completed Tasks – Scrollable */}
          <section className="bg-white shadow-xl rounded-xl flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sticky top-0 bg-white z-10 shadow-sm rounded-t-xl">
              <h2 className="text-lg font-semibold">Completed Tasks</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <TaskCard status="Completed" title="Walk the dog" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Conduct meeting" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Walk the dog" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Conduct meeting" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Walk the dog" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Conduct meeting" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Walk the dog" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Conduct meeting" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Walk the dog" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              <TaskCard status="Completed" title="Conduct meeting" time="--" date="2 days ago" imageUrl="https://via.placeholder.com/100" />
              {/* More TaskCards... */}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Progress Bar Component
const Progress = ({ title, percent, color }) => (
  <div>
    <div className="flex justify-between text-sm font-medium mb-1">
      <span>{title}</span>
      <span>{percent}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className={`h-3 rounded-full bg-${color}-500`}
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  </div>
);

export default TaskBoard;

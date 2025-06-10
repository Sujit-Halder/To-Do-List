import React, { useEffect, useState } from 'react';

const LiveTaskManager = ({ userTasklists }) => {
  const [tasklists, setTasklists] = useState([]);


  const updateStatuses = (tasklists) => {
    const now = new Date();
  
    return tasklists.map((tasklist) => {
      const updatedTasks = tasklist.tasks.map((task) => {
        const taskTime = new Date(`${task.date}T${task.time}`);
        if (task.status !== 'Completed' && task.status !== 'Overdue' && taskTime < now) {
          return { ...task, status: 'Overdue' };
        }
        return task;
      });
  
      return { ...tasklist, tasks: updatedTasks };
    });
  };

  
  useEffect(() => {
    const updateAllStatuses = () => {
      const updated = updateStatuses(userTasklists);
      setTasklists(updated);
    };

    updateAllStatuses(); 
    const interval = setInterval(updateAllStatuses, 60 * 1000); 
    return () => clearInterval(interval);
  }, [userTasklists]);

  return (
    <>
      {tasklists.map((tasklist, i) => (
        <div key={i}>
          <h3>{tasklist.name}</h3>
          {tasklist.tasks.map((task, j) => (
            <TaskCard
              key={j}
              taskData={task}
              // your edit/delete handlers here
            />
          ))}
        </div>
      ))}
    </>
  );
};

export default LiveTaskManager;
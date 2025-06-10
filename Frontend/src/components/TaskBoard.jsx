import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddTaskModal from './AddTaskModal';
import TaskCard from './TaskCard';
import axios from 'axios';
import { FaClipboardList, FaPlus, FaChartPie, FaCheckCircle } from 'react-icons/fa';
import Progress from './ProgressBar';

const TaskBoard = React.memo(({ user, selectedTasklist }) => {
  const [showModal, setShowModal] = useState(false);
  const [tasklists, setTasklists] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [sortType1, setSortType1] = useState('date');
  const [filterType1, setFilterType1] = useState('all');
  const [order1, setOrder1] = useState('asc');
  const [sortType2, setSortType2] = useState('date');
  const [filterType2, setFilterType2] = useState('all');
  const [order2, setOrder2] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.tasklists) {
      setTasklists(user.tasklists);
    }
  }, [user]);


  const handleAddTask = async (taskData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/user/task',
        { tasklistName: selectedTasklist || taskData.title, task: taskData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setTasklists(response.data.tasklists);
      } else {
        alert('Failed to add task list. Please try again.');
      }
    } catch (err) {
      console.error('Failed to add task:', err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || 'Failed to add task. Please try again.'}`);
    }
  };

  const handleEditTask = async (updatedTask) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/user/task`,
        { updatedTask },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        setTasklists(response.data.tasklists);
      } else {
        alert('Failed to edit task. Please try again.');
      }
    } catch (err) {
      console.error('Failed to edit task:', err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || 'Failed to edit task. Please try again.'}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/user/task`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { taskId },
        }
      );
      if (response.status === 200) {
        setTasklists(response.data.tasklists);
      } else {
        alert('Failed to delete task. Please try again.');
      }
    } catch (err) {
      console.error('Failed to delete task:', err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || 'Failed to delete task. Please try again.'}`);
    }
  };

  const handleMarkAsComplete = async (taskId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/user/task/complete`,
        { taskId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        setTasklists(response.data.tasklists);
      } else {
        alert('Failed to mark task as complete. Please try again.');
      }
    } catch (err) {
      console.error('Failed to mark task as complete:', err.response?.data || err.message);
      alert(`Error: ${err.response?.data?.message || 'Failed to mark task as complete. Please try again.'}`);
    }
  };

  const handleOpenEditModal = (task) => {
    const formattedTask = {
      ...task
    };
    setEditingTask(formattedTask);
    setShowModal(true);
  };

  const handleSaveTask = (taskData) => {
    if (editingTask) {
      handleEditTask(taskData);
    } else {
      handleAddTask(taskData);
    }
    setShowModal(false);
    setEditingTask(null);
  };

  const renderTasks = () => {
    if (tasklists.length === 0) {
      return <p>No tasks available.</p>;
    }

    const tasks = selectedTasklist
      ? tasklists.find((tl) => tl.name === selectedTasklist)?.tasks.map((task) => ({
        ...task,
        tasklistName: selectedTasklist,
      })) || []
      : tasklists.flatMap((tasklist) =>
        tasklist.tasks.map((task) => ({
          ...task,
          tasklistName: tasklist.name,
        }))
      ).filter((task) => task.status !== 'Completed' && task.status !== 'Overdue');

    // Apply status filter
    const filteredTasks = tasks.filter((task) => {
      if (filterType1 === 'all') return true;
      return task.status === filterType1 || task.priority === filterType1;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
      let comparison = 0;

      switch (sortType1) {
        case 'date':
          comparison = new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'creation':
          comparison = new Date(b.creationTime) - new Date(a.creationTime);
          break;
        case 'modification':
          comparison = new Date(b.modificationTime) - new Date(a.modificationTime);
          break;
        case 'completion':
          comparison = new Date(b.completionTime || (a.date + 'T' + a.time)) - new Date(a.completionTime || (a.date + 'T' + a.time));
          break;
        default:
          comparison = 0;
      }

      // Adjust comparison based on order1
      return order1 === 'desc' ? -comparison : comparison;
    });

    return sortedTasks.map((task, index) => (
      <TaskCard
        key={index}
        taskData={task}
        tasklistName={task.tasklistName}
        onEdit={(taskData) => handleOpenEditModal(taskData)}
        onDelete={() => handleDeleteTask(task.id)}
        onToggleComplete={() => handleMarkAsComplete(task.id)}
      />
    ));
  };


  const renderCompleteTasks = () => {
    if (tasklists.length === 0) {
      return <p>No tasks available.</p>;
    }

    const tasks = selectedTasklist
      ? tasklists.find((tl) => tl.name === selectedTasklist)?.tasks
        .filter((task) => task.status === 'Completed' || task.status === 'Overdue')
        .map((task) => ({
          ...task,
          tasklistName: selectedTasklist,
        })) || []
      : tasklists.flatMap((tasklist) =>
        tasklist.tasks.map((task) => ({
          ...task,
          tasklistName: tasklist.name,
        }))
      ).filter((task) => task.status === 'Completed' || task.status === 'Overdue');

    // Apply status filter
    const filteredTasks = tasks.filter((task) => {
      if (filterType2 === 'all') return true;
      return task.status === filterType2 || task.priority === filterType2;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
      let comparison = 0;

      switch (sortType2) {
        case 'date':
          comparison = new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time);
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'creation':
          comparison = new Date(b.creationTime) - new Date(a.creationTime);
          break;
        case 'modification':
          comparison = new Date(b.modificationTime) - new Date(a.modificationTime);
          break;
        case 'completion':
          comparison = new Date(b.completionTime || (a.date + 'T' + a.time)) - new Date(a.completionTime || (a.date + 'T' + a.time));
          break;
        default:
          comparison = 0;
      }

      // Adjust comparison based on order1
      return order2 === 'desc' ? -comparison : comparison;
    });

    return sortedTasks.map((task, index) => (
      <TaskCard
        key={index}
        taskData={task}
        tasklistName={task.tasklistName}
        onEdit={(taskData) => handleOpenEditModal(taskData)}
        onDelete={() => handleDeleteTask(task.id)}
        onToggleComplete={() => handleMarkAsComplete(task.id)}
      />
    ));
  };



  return (
    <div className="h-screen flex flex-col pb-15 pt-6 pl-6 pr-2">
      <h1 className="text-4xl font-bold mb-3">
        Welcome back, <span className="text-red-400">{user?.name}</span> 👋
      </h1>

      <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
        <section className="col-span-2 bg-white shadow-xl rounded-xl flex flex-col overflow-hidden">
          <div className="p-4 sticky top-0 bg-white z-10 shadow-sm flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-2">
              <FaClipboardList className="text-red-400" />
              <h2 className="text-lg font-semibold">To-Do</h2>
            </div>

            <div className="flex justify-end">
              <select
                value={filterType1}
                onChange={(e) => setFilterType1(e.target.value)}
                className="absolute  right-98 bottom-4.5  bg-gray-200 text-black rounded-full px-2 py-1 text-sm shadow-inner focus:outline-none focus: hover:bg-red-500hover:text-white transition-colors"
              >
                <optgroup label="Filter By Status">
                  <option value="all">all</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                </optgroup>
                <optgroup label="Filter By Priority">
                  <option value="High">High</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Low">Low</option>
                </optgroup>
              </select>
            </div>
            <div className="flex justify-end">
              <select
                value={sortType1}
                onChange={(e) => setSortType1(e.target.value)}
                className="absolute  right-58.5 bottom-4.5  bg-gray-200 text-black rounded-full px-2 py-1 text-sm shadow-inner focus:outline-none focus: hover:bg-red-500hover:text-white transition-colors"
              >
                <optgroup label="Sort By">
                  <option value="name">Name</option>
                  <option value="date">Date</option>
                  <option value="modification">Last Modified Date</option>
                  <option value="completion" hidden={!selectedTasklist} >Completed Date</option>
                  <option value="creation">Created Date</option>

                </optgroup>
              </select>
            </div>
            <div className="flex justify-end">
              <select
                value={order1}
                onChange={(e) => setOrder1(e.target.value)}
                className="absolute  right-30 bottom-4.5  bg-gray-200 text-black rounded-full px-2 py-1 text-sm shadow-inner focus:outline-none focus: hover:bg-red-500hover:text-white transition-colors"
              >
                <optgroup label='Order By'>
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </optgroup>
              </select>
            </div>


            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 text-sm text-white bg-red-400 hover:bg-red-500 px-3 py-1 rounded-full shadow"
              title='Create a Task for remainder later'
            >
              <FaPlus />
              <span>Add Task</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {renderTasks()}
          </div>
        </section>

        <div className="flex flex-col gap-6 overflow-hidden">
          <section className="bg-white shadow-xl rounded-xl p-4 shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <FaChartPie className="text-green-500" />
              <h2 className="text-lg font-semibold">Task Status</h2>
            </div>

            {tasklists.length > 0 && (
              <>
                <Progress
                  title="Overdue"
                  percent={
                    tasklists.flatMap((tasklist) => tasklist.tasks).length > 0
                      ? parseFloat(
                        (tasklists.flatMap((tasklist) => tasklist.tasks).filter((task) => task.status === 'Overdue').length /
                          tasklists.flatMap((tasklist) => tasklist.tasks).length) * 100
                      ).toFixed(3)
                      : 0 // Default to 0% if there are no tasks
                  }
                  color="orange"
                />
                <Progress
                  title="Completed"
                  percent={
                    tasklists.flatMap((tasklist) => tasklist.tasks).length > 0
                      ? parseFloat(
                        (tasklists.flatMap((tasklist) => tasklist.tasks).filter((task) => task.status === 'Completed').length /
                          tasklists.flatMap((tasklist) => tasklist.tasks).length) * 100
                      ).toFixed(3)
                      : 0
                  }
                  color="green"
                />
                <Progress
                  title="In Progress"
                  percent={
                    tasklists.flatMap((tasklist) => tasklist.tasks).length > 0
                      ? parseFloat(
                        (tasklists.flatMap((tasklist) => tasklist.tasks).filter((task) => task.status === 'In Progress').length /
                          tasklists.flatMap((tasklist) => tasklist.tasks).length) * 100
                      ).toFixed(3)
                      : 0
                  }
                  color="blue"
                />
                <Progress
                  title="Not Started"
                  percent={
                    tasklists.flatMap((tasklist) => tasklist.tasks).length > 0
                      ? parseFloat(
                        (tasklists.flatMap((tasklist) => tasklist.tasks).filter((task) => task.status === 'Not Started').length /
                          tasklists.flatMap((tasklist) => tasklist.tasks).length) * 100
                      ).toFixed(3)
                      : 0
                  }
                  color="red"
                />
              </>
            )}
          </section>

          <section className="bg-white shadow-xl rounded-xl flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sticky top-0 bg-white z-10 shadow-sm rounded-t-xl flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-blue-500" />
                <h2 className="text-lg font-semibold">Completed & Overdue Tasks</h2>
              </div>

              <div className="flex gap-4 items-center justify-start">
                <select
                  value={filterType2}
                  onChange={(e) => setFilterType2(e.target.value)}
                  className="bg-gray-200 text-black rounded-full px-2 py-1 text-sm shadow-inner focus:outline-none hover:bg-red-500 hover:text-white transition-colors"
                >
                  <optgroup label="Filter By Status">
                    <option value="all">All</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </optgroup>
                  <optgroup label="Filter By Priority">
                    <option value="High">High</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Low">Low</option>
                  </optgroup>
                </select>

                <select
                  value={sortType2}
                  onChange={(e) => setSortType2(e.target.value)}
                  className="bg-gray-200 text-black rounded-full px-2 py-1 text-sm shadow-inner focus:outline-none hover:bg-red-500 hover:text-white transition-colors"
                >
                  <optgroup label="Sort By">
                    <option value="name">Name</option>
                    <option value="date">Date</option>
                    <option value="creation">Created Date</option>
                    <option value="modification">Modified Date</option>
                    <option value="completion">Completed Date</option>
                  </optgroup>
                </select>

                <select
                  value={order2}
                  onChange={(e) => setOrder2(e.target.value)}
                  className="bg-gray-200 text-black rounded-full px-2 py-1 text-sm shadow-inner focus:outline-none hover:bg-red-500 hover:text-white transition-colors"
                >
                  <optgroup label="Order By">
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {renderCompleteTasks()}
            </div>
          </section>
        </div>
      </div>

      {showModal && (
        <AddTaskModal
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSubmit={handleSaveTask}
          initialData={editingTask}
        />
      )}

    </div>
  );
});



export default TaskBoard;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddTaskModal from './AddTaskModal';
import TaskCard from './TaskCard';
import axios from 'axios';
import { FaClipboardList, FaPlus, FaChartPie, FaCheckCircle } from 'react-icons/fa';
import Progress from './ProgressBar';
import { notify } from '../utils/notifications';

const EmptyTasks = ({ completed = false }) => (
  <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
    <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-xl text-red-400">{completed ? <FaCheckCircle /> : <FaClipboardList />}</span>
    <p className="font-semibold text-slate-800">{completed ? 'No completed or overdue tasks' : 'Your task list is clear'}</p>
    <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">{completed ? 'Finished and overdue tasks will appear here.' : 'Use Add Task when you are ready to plan something new.'}</p>
  </div>
);

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
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const navigate = useNavigate();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768); // Small screen if width <= 768px
    };

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (user?.tasklists) {
      setTasklists(user.tasklists);
    }
  }, [user]);


  const handleAddTask = async (taskData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/user/task`,
        { tasklistName: selectedTasklist || 'Other Task', task: taskData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 200) {
        setTasklists(response.data.tasklists);
        notify(response.data.message || 'Task added.', 'success');
      } else {
        notify('The task could not be added. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Failed to add task:', err.response?.data || err.message);
      notify(err.response?.data?.message || 'The task could not be added. Please try again.', 'error');
    }
  };

  const handleEditTask = async (updatedTask) => {
    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/task`,
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
        notify(response.data.message || 'Task updated.', 'success');
      } else {
        notify('The task could not be updated. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Failed to edit task:', err.response?.data || err.message);
      notify(err.response?.data?.message || 'The task could not be updated. Please try again.', 'error');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/user/task`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { taskId },
        }
      );
      if (response.status === 200) {
        setTasklists(response.data.tasklists);
        notify(response.data.message || 'Task deleted.', 'success');
      } else {
        notify('The task could not be deleted. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Failed to delete task:', err.response?.data || err.message);
      notify(err.response?.data?.message || 'The task could not be deleted. Please try again.', 'error');
    }
  };

  const handleMarkAsComplete = async (taskId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      notify('Your session has expired. Please sign in again.', 'warning');
      navigate('/login');
      return;
    }
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/user/task/complete`,
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
        notify(response.data.message || 'Task status updated.', 'success');
      } else {
        notify('The task status could not be updated. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Failed to mark task as complete:', err.response?.data || err.message);
      notify(err.response?.data?.message || 'The task status could not be updated. Please try again.', 'error');
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
      return <EmptyTasks />;
    }

    const tasks = selectedTasklist
      ? tasklists.find((tl) => tl.name === selectedTasklist)?.tasks
        .filter((task) => task.status !== 'Completed' && task.status !== 'Overdue')
        .map((task) => ({
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

    if (!sortedTasks.length) return <EmptyTasks />;
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
      return <EmptyTasks completed />;
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

    if (!sortedTasks.length) return <EmptyTasks completed />;
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
    <div className="flex min-h-full flex-col p-4 lg:h-full lg:p-6">
      <h1 className="mb-4 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
        Welcome back, <span className="text-red-400">{user?.name}</span> 👋
      </h1>

      {
        !isSmallScreen &&
        <div className="grid flex-1 grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-5 overflow-hidden">
          <section className="surface-card col-span-1 flex min-w-0 flex-col overflow-hidden">
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-slate-100 bg-white p-4">
              <div className="mr-auto flex items-center gap-2">
                <FaClipboardList className="text-red-400" />
                <h2 className="text-lg font-semibold">To-Do</h2>
              </div>

              <div>
                <select
                  value={filterType1}
                  title="Filter active tasks by status or priority"
                  onChange={(e) => setFilterType1(e.target.value)}
                  className="field-control w-auto py-1.5 text-xs"
                >
                  <optgroup label="Filter By Status">
                    <option value="all">All</option>
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
              <div>
                <select
                  value={sortType1}
                  title="Choose how active tasks are sorted"
                  onChange={(e) => setSortType1(e.target.value)}
                  className="field-control w-auto py-1.5 text-xs"
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
              <div>
                <select
                  value={order1}
                  title="Choose ascending or descending order"
                  onChange={(e) => setOrder1(e.target.value)}
                  className="field-control w-auto py-1.5 text-xs"
                >
                  <optgroup label='Order By'>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </optgroup>
                </select>
              </div>


              <button
                onClick={() => setShowModal(true)}
                className="button-primary px-3 py-2"
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
            <section className="surface-card shrink-0 space-y-3 p-4">
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
                    color="red"
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
                    color="orange"
                  />
                </>
              )}
            </section>

            <section className="surface-card flex flex-1 flex-col overflow-hidden">
              <div className="p-4 sticky top-0 bg-white z-10 shadow-sm rounded-t-xl flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" />
                  <h2 className="text-lg font-semibold">Completed & Overdue Tasks</h2>
                </div>

                <div className="flex gap-4 items-center justify-start">
                  <select
                    value={filterType2}
                    title="Filter completed and overdue tasks"
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
                    title="Choose how completed tasks are sorted"
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
                    title="Choose ascending or descending order"
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
      }

      {
        isSmallScreen && !(selectedTasklist === 'Completed & Overdue Tasks' || selectedTasklist === 'Tasks Progress') &&
        <section className="surface-card mb-8 flex flex-col overflow-hidden">
          <div className="p-4 sticky top-0 bg-white z-10 shadow-sm flex-col justify-between items-center rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className='flex items-center gap-2'>
                <FaClipboardList className="text-red-400" />
                <h2 className="text-lg font-semibold">To-Do</h2>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="button-primary px-3 py-2"
                title='Create a Task for remainder later'
              >
                <FaPlus />
                <span>Add Task</span>
              </button>
            </div>
            <div className='flex flex-wrap justify-between gap-2 mt-3'>
              <div className="">
                <select
                  value={filterType1}
                  title="Filter active tasks by status or priority"
                  onChange={(e) => setFilterType1(e.target.value)}
                  className="field-control w-auto py-1.5 text-xs"
                >
                  <optgroup label="Filter By Status">
                    <option value="all">All</option>
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
              <div className="">
                <select
                  value={sortType1}
                  title="Choose how active tasks are sorted"
                  onChange={(e) => setSortType1(e.target.value)}
                  className="field-control w-auto py-1.5 text-xs"
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
              <div className="">
                <select
                  value={order1}
                  title="Choose ascending or descending order"
                  onChange={(e) => setOrder1(e.target.value)}
                  className="field-control w-auto py-1.5 text-xs"
                >
                  <optgroup label='Order By'>
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {renderTasks()}
          </div>
        </section>
      }

      {
        isSmallScreen && selectedTasklist === 'Completed & Overdue Tasks' &&
        <section className="surface-card flex flex-1 flex-col overflow-hidden">
          <div className="p-4 sticky top-0 bg-white z-10 shadow-sm rounded-t-xl flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <FaCheckCircle className="text-blue-500" />
              <h2 className="text-lg font-semibold">Completed & Overdue Tasks</h2>
            </div>

            <div className="flex gap-4 items-center justify-start">
              <select
                value={filterType2}
                title="Filter completed and overdue tasks"
                onChange={(e) => setFilterType2(e.target.value)}
                className="w-20 bg-gray-200 text-black rounded-full px-2 py-1 text-sm shadow-inner focus:outline-none hover:bg-red-500 hover:text-white transition-colors"
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
                title="Choose how completed tasks are sorted"
                onChange={(e) => setSortType2(e.target.value)}
                className="w-20 bg-gray-200 text-black rounded-full px-2 py-1 text-sm shadow-inner focus:outline-none hover:bg-red-500 hover:text-white transition-colors"
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
                title="Choose ascending or descending order"
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
            {
              tasklists.flatMap((tasklist) =>
                tasklist.tasks.map((task) => ({
                  ...task,
                  tasklistName: tasklist.name,
                }))
              )
                .filter((task) => task.status === 'Completed' || task.status === 'Overdue')
                .sort((a, b) => new Date(b.completionTime || b.date) - new Date(a.completionTime || a.date))
                .map((task, index) => (
                  <TaskCard
                    key={index}
                    taskData={task}
                    tasklistName={task.tasklistName}
                    onEdit={(taskData) => handleOpenEditModal(taskData)}
                    onDelete={() => handleDeleteTask(task.id)}
                    onToggleComplete={() => handleMarkAsComplete(task.id)}
                  />
                ))
            }
          </div>
        </section>
      }

      {
        isSmallScreen && selectedTasklist === 'Tasks Progress' &&
        <section className="surface-card shrink-0 space-y-3 p-4">
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
                color="red"
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
                color="orange"
              />
            </>
          )}
        </section>

      }

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

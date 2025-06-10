import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaTasks, FaCog, FaQuestionCircle, FaSignOutAlt, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import MenuItem from './MenuItem';
import ProfileImageUploader from './ProfileImageUploader';
import axios from 'axios';

const Sidebar = React.memo(({ user, onTasklistSelect }) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [tasklists, setTasklists] = useState([]);
  const [showTaskLists, setShowTaskLists] = useState(false);

  // Fetch task lists from user prop on mount
  useEffect(() => {
    if (user?.tasklists) {
      setTasklists(user.tasklists);
    }
  }, [user]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleMenuClick = (menuName) => {
    setActiveItem(menuName);
    onTasklistSelect(null);
    if (menuName === 'Logout') {
      handleLogout();
    }
    if (menuName === 'Task Categories') {
      setShowTaskLists(!showTaskLists);
    }
  };

  const handleAddTaskList = async () => {
    const newTaskListName = prompt('Enter new task list name:');
    if (!newTaskListName) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/user/tasklists',
        { name: newTaskListName, tasks: [] },
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
    } catch (error) {
      console.error('Error adding task list:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || 'Failed to add task list. Please try again.'}`);
    }
  };

  const handleEditTaskList = async (tasklistName) => {
    const newName = prompt(`Edit task list name for "${tasklistName}":`, tasklistName);
    if (!newName || newName === tasklistName) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.put(
        'http://localhost:5000/api/user/tasklists',
        { oldName: tasklistName, newName },
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
        alert('Failed to edit task list. Please try again.');
      }
    } catch (error) {
      console.error('Error editing task list:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || 'Failed to edit task list. Please try again.'}`);
    }
  };

  const handleDeleteTaskList = async (tasklistName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the task list "${tasklistName}"?`);
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired. Please log in again.');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.delete('http://localhost:5000/api/user/tasklists', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { name: tasklistName },
      });

      if (response.status === 200) {
        setTasklists(response.data.tasklists);
      } else {
        alert('Failed to delete task list. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting task list:', error.response?.data || error.message);
      alert(`Error: ${error.response?.data?.message || 'Failed to delete task list. Please try again.'}`);
    }
  };

  const handleTasklistClick = (tasklistName) => {
    if (activeItem === tasklistName) {
      return;
    }
    setActiveItem(tasklistName);
    onTasklistSelect(tasklistName);
  };

  return (
    <aside className="w-115 bg-red-400 text-white flex flex-col justify-between py-6 px-4 rounded-r-lg relative">
      <div>
        <div className="flex flex-col items-center space-y-2 mb-10">
          <ProfileImageUploader currentImage={user?.image} />
          <h2 className="text-4xl font-semibold text-white-800">{user?.name}</h2>
          <p className="text-lg text-white-500">{user?.email}</p>
        </div>

        <nav className="space-y-3">
          {/* Static Menu Items */}
          <MenuItem
            icon={<FaTachometerAlt />}
            text="Dashboard"
            active={activeItem === 'Dashboard'}
            onClick={() => handleMenuClick('Dashboard')}
          />

          {/* Task Categories */}
          <div>
            <MenuItem
              icon={<FaTasks />}
              text="Task Categories"
              active={(activeItem === 'Task Categories') || ((activeItem !== 'Dashboard') && (activeItem !== 'Settings') && (activeItem !== 'Help') && (activeItem !== 'Logout'))}
              onClick={() => handleMenuClick('Task Categories')}
            />
            {showTaskLists && (
              <div className="bg-red-400 p-4 rounded-lg shadow-lg space-y-3 mt-2 relative pb-12"> 
                {/* Scrollable Dynamic Task Lists */}
                <div className="max-h-50 overflow-y-auto space-y-3">
                  {tasklists.map((tasklist, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <MenuItem
                        icon={<FaTasks />}
                        text={tasklist.name}
                        active={activeItem === tasklist.name}
                        onClick={() => handleTasklistClick(tasklist.name)}
                      />
                      <div className="flex space-x-2 mr-4">
                        <button
                          onClick={() => handleEditTaskList(tasklist.name)}
                          className="text-white bg-blue-500 hover:bg-blue-600 p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-110"
                          aria-label="Edit Task List"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteTaskList(tasklist.name)}
                          className="text-white bg-red-500 hover:bg-red-600 p-2  rounded-full shadow-md transition-transform duration-300 hover:scale-110"
                          aria-label="Delete Task List"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Add Task List Button */}
                <button
                  onClick={handleAddTaskList}
                  className="absolute bottom-4 right-13 text-white bg-green-500 hover:bg-green-600 p-2 rounded-full shadow-md transition-transform duration-300 hover:scale-110"
                  aria-label="Add Task List"
                >
                  <FaPlus />
                </button>
              </div>
            )}
          </div>

          {/* Static Menu Items */}
          <MenuItem
            icon={<FaCog />}
            text="Settings"
            active={activeItem === 'Settings'}
            onClick={() => handleMenuClick('Settings')}
          />
          <MenuItem
            icon={<FaQuestionCircle />}
            text="Help"
            active={activeItem === 'Help'}
            onClick={() => handleMenuClick('Help')}
          />
        </nav>
      </div>

      <MenuItem
        icon={<FaSignOutAlt />}
        text="Logout"
        active={activeItem === 'Logout'}
        onClick={() => handleMenuClick('Logout')}
      />
    </aside>
  );
});

export default Sidebar;
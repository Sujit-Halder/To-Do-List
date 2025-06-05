import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaTasks, FaCog, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import MenuItem from './MenuItem';

const Sidebar = ({user}) => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('Dashboard');

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleMenuClick = (menuName) => {
    setActiveItem(menuName);
    console.log(`${menuName} clicked`);
    if (menuName === 'Logout') {
      handleLogout();
    }
  };

  return (
    <aside className="w-100 bg-red-400 text-white flex flex-col justify-between py-6 px-4 rounded-r-lg ">
      <div>
        <div className="flex flex-col items-center space-y-2 mb-10">
          <img
            src="https://i.pravatar.cc/100"
            alt="Profile"
            className="w-20 h-20 rounded-full mb-4 border-4 border-red-400"
          />
          <h2 className="text-lg font-semibold text-white-800">{user?.name}</h2>
          <p className="text-sm text-white-500">{user?.email}</p>
        </div>

        <nav className="space-y-3">
          <MenuItem
            icon={<FaTachometerAlt />}
            text="Dashboard"
            active={activeItem === 'Dashboard'}
            onClick={() => handleMenuClick('Dashboard')}
          />
          <MenuItem
            icon={<FaTasks />}
            text="Vital Task"
            active={activeItem === 'Vital Task'}
            onClick={() => handleMenuClick('Vital Task')}
          />
          <MenuItem
            icon={<FaTasks />}
            text="My Task"
            active={activeItem === 'My Task'}
            onClick={() => handleMenuClick('My Task')}
          />
          <MenuItem
            icon={<FaTasks />}
            text="Task Categories"
            active={activeItem === 'Task Categories'}
            onClick={() => handleMenuClick('Task Categories')}
          />
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
};

export default Sidebar;

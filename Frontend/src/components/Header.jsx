import React from 'react';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';

const Header = ({user}) => {
  return (
    <header className="flex items-center justify-between bg-white p-4 shadow-sm">
      <h1 className="text-4xl font-bold"><span className="text-red-400"> Dash</span>board</h1>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search your task here..."
            className="pl-10 pr-4 py-2 rounded-lg border text-sm"
          />
          <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
        </div>
        <FaCalendarAlt className="text-xl text-gray-600" />
        <p className="text-sm text-gray-500">Tuesday, 20/06/2023</p>
      </div>
    </header>
  );
};

export default Header;

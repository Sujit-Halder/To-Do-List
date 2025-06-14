import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';

const Header = React.memo(({ user }) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    })
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const filtered = user?.tasklists
        ?.flatMap((tasklist) => tasklist.tasks) // Flatten all tasks from all tasklists
        ?.filter((task) =>
          task.title.toLowerCase().includes(search.toLowerCase())
        );

      setResults(filtered || []);
      console.log('Search Results:', filtered);
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row items-center justify-between bg-white p-4 shadow-sm">
        <h1 className="text-4xl font-bold mb-4 md:mb-0">
          <span className="text-red-400"> Dash</span>board
        </h1>
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative w-full md:w-auto">
            <input
              name="search"
              type="text"
              placeholder="Search your task here..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 py-2 rounded-lg border text-sm w-full md:w-100 hover:w-full md:hover:w-300 focus:w-full md:focus:w-300 transition-all duration-200"
            />
            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="hidden md:flex items-center"> {/* Timer hidden on small screens */}
            <FaCalendarAlt className="text-xl text-gray-600" />
            <p
              className="text-sm text-gray-500"
              style={{
                width: '250px', // Fixed width to prevent shaking
                textAlign: 'center', // Center-align the text
                whiteSpace: 'nowrap', // Prevent wrapping
              }}
            >
              {currentTime}
            </p>
          </div>
        </div>
      </header>

      {/* 🧠 Place this below header */}
      {results.length > 0 && (
        <div className="bg-white shadow p-4 mx-4 mt-2 rounded">
          <h2 className="font-semibold mb-2">Search Results:</h2>
          <ul className="list-disc pl-5">
            {results.map((task) => (
              <li key={task.id} className="text-sm text-gray-700">
                {task.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
});

export default Header;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TaskBoard from '../components/TaskBoard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedTasklist, setSelectedTasklist] = useState(null);

  useEffect(() => {
    let isMounted = true; // Flag to track if the component is still mounted

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (isMounted) {
          setUserData(res.data.user);
          alert(`Welcome back, ${res.data.user.name}!`);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response && err.response.status === 401) {
          alert('Session expired. Please log in again.');
        } else {
          alert('Failed to fetch dashboard data. Please try again later.');
        }
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header user={userData} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={userData} onTasklistSelect={setSelectedTasklist} />
        <main className="flex-1 pt-0 pl-1 pr-1 pb-4 sticky top-0 z-10">
          <TaskBoard user={userData} selectedTasklist={selectedTasklist} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

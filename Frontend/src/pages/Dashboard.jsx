import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TaskBoard from '../components/TaskBoard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/auth/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUserData(res.data.user);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header user={userData} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={userData} />
        <main className="flex-1 pt-4 pl-10 pr-10 pb-4 overflow-auto">
          <TaskBoard user={userData} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

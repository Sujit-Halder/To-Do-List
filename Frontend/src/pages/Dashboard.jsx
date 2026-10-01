import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TaskBoard from '../components/TaskBoard';
import ActivityLog from '../components/ActivityLog';
import SettingsPanel from '../components/SettingsPanel';
import HelpPanel from '../components/HelpPanel';
import { notify } from '../utils/notifications';

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [selectedTasklist, setSelectedTasklist] = useState(null);

  useEffect(() => {
    let isMounted = true;

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
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (err.response && err.response.status === 401) {
          notify('Your session has expired. Please sign in again.', 'warning');
        } else {
          notify('The dashboard could not be loaded. Please try again.', 'error');
        }
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="app-page min-h-screen bg-[#f5f7fb] lg:h-screen lg:overflow-hidden">
      {/* Header */}
      <Header user={userData} />

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-73px)] lg:h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <Sidebar user={userData} onTasklistSelect={setSelectedTasklist} />

        {/* TaskBoard */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          {selectedTasklist === 'Activity Log' && <ActivityLog />}
          {selectedTasklist === 'Settings' && <SettingsPanel />}
          {selectedTasklist === 'Help' && <HelpPanel />}
          {!['Activity Log', 'Settings', 'Help'].includes(selectedTasklist) && <TaskBoard user={userData} selectedTasklist={selectedTasklist} />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

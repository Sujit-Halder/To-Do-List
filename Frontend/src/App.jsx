import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';


// Set up interceptor once at the top level
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 403) {
      alert('Access denied: You do not have permission.');
      // optional: redirect to login or logout logic here
      // Note: can't use useNavigate() directly here since not in React component
      // You could use window.location:
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />

        {/* 🔐 Protected Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all: redirect to landing */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

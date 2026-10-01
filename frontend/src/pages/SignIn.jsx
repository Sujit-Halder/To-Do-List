import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/notifications";

const SignIn = () => {
  const [form, setForm] = useState({
    identifier: "",
    password: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signin`, form);
      localStorage.setItem('token', response.data.token);
      navigate("/dashboard");
    } catch (err) {
      if (err.response) {
        // Extract the specific error message from the server
        const errorMessage = err.response.data.message || "An error occurred on the server.";
        notify(errorMessage, 'error');
      } else if (err.request) {
        // Handle network errors
        notify("The server could not be reached. Check your connection and try again.", 'error');
      } else {
        // Handle unexpected errors
        notify(`Something unexpected happened: ${err.message}`, 'error');
      }
    }
  };

  
  return (
    <div className="app-page auth-page flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#ffe4e5,transparent_40%),#f5f7fb] p-4">
      <form onSubmit={handleSubmit} className="surface-card w-full max-w-sm p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3"><img src="/taskpro.svg" alt="" className="h-11 w-11" /><p className="font-semibold text-slate-800"><span className="text-red-400">Task</span>Pro+</p></div>
        <h2 className="mb-1 mt-2 text-2xl font-bold">Welcome back</h2>
        <p className="mb-6 text-sm text-slate-500">Sign in to continue to your dashboard.</p>
        <input
          name="identifier"
          type="email"
          placeholder="Email"
          value={form.identifier}
          onChange={handleChange}
          required
          className="field-control mb-3" />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="field-control mb-4" />

        <button type="submit" className="button-primary w-full">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;

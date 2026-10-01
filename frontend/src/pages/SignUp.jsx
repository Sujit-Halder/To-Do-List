import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { notify } from "../utils/notifications";

const SignUp = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    phone: "",
    age: "",
    gender: "",
    profession: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, form);
      notify(response.data.message, 'success');
      navigate("/login");
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
    <div className="app-page auth-page flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#ffe4e5,transparent_40%),#f5f7fb] p-4 py-10">
      <form onSubmit={handleSubmit} className="surface-card w-full max-w-lg p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3"><img src="/taskpro.svg" alt="" className="h-11 w-11" /><p className="font-semibold text-slate-800"><span className="text-red-400">Task</span>Pro+</p></div>
        <h2 className="mb-1 mt-2 text-2xl font-bold">Create your account</h2>
        <p className="mb-6 text-sm text-slate-500">Set up your workspace in a minute.</p>
        <div className="grid gap-x-3 sm:grid-cols-2">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          pattern="^[a-z0-9]+$"
          minLength={10}
          maxLength={20}
          required
          className="field-control mb-3"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="field-control mb-3"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          maxLength={64}
          required
          className="field-control mb-3"
        />

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          pattern="^[a-z A-z]+$"
          minLength={2}
          required
          className="field-control mb-3"
        />

        <input
          type="phone"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="field-control mb-3"
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          min={0}
          required
          className="field-control mb-3"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="field-control mb-3"
        >
          <option value="">Select a Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="transgender">Transgender</option>
          <option value="other">Other</option>
        </select>

        <select
          name="profession"
          value={form.profession}
          onChange={handleChange}
          required
          className="field-control mb-3"
        >
          <option value="">Select a profession</option>
          <option value="student">Student</option>
          <option value="engineer">Engineer</option>
          <option value="teacher">Teacher</option>
          <option value="developer">Developer</option>
          <option value="other">Other</option>
        </select>
        </div>
        <button type="submit" className="button-primary mt-1 w-full">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;

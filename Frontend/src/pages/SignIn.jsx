import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = ({ setAuth }) => {
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
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signin`, form);
      localStorage.setItem('token', response.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
        <input
          name="identifier"
          type="email"
          placeholder="Email"
          value={form.identifier}
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border rounded" />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border rounded" />

        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;
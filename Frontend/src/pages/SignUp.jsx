import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      alert(response.data.message);
      navigate("/signin");
    } catch (err) {
      if (err.response) {
        // Extract the specific error message from the server
        const errorMessage = err.response.data.message || "An error occurred on the server.";
        alert(errorMessage);
      } else if (err.request) {
        // Handle network errors
        alert("No response from the server. Please check your internet connection.");
      } else {
        // Handle unexpected errors
        alert(`Unexpected Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white shadow-md p-6 rounded w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
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
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border rounded"
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
          className="w-full mb-3 p-2 border rounded"
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
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="phone"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="number"
          name="age"
          placeholder="Age"
          value={form.age}
          onChange={handleChange}
          min={0}
          required
          className="w-full mb-3 p-2 border rounded"
        />

        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          className="w-full mb-3 p-2 border rounded"
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
          className="w-full mb-3 p-2 border rounded"
        >
          <option value="">Select a profession</option>
          <option value="student">Student</option>
          <option value="engineer">Engineer</option>
          <option value="teacher">Teacher</option>
          <option value="developer">Developer</option>
          <option value="other">Other</option>
        </select>
        <button type="submit" className="bg-green-600 text-white w-full py-2 rounded hover:bg-green-700">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;

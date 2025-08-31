import React, { useState } from "react";
import { login, signup } from "../services/api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(username, password);
        onLogin(username);
      } else {
        await signup(username, password);
        alert("Signup successful! Please login.");
        setMode("login");
        resetForm();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Error logging in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-500 via-indigo-500 to-green-600">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          {mode === "login" ? "Welcome Back 👋" : "Create Account 🚀"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          {error && (
            <div className="text-red-600 text-sm font-medium">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 shadow-md transition-transform transform hover:scale-105"
          >
            {mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          {mode === "login" ? "New user?" : "Already have an account?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              resetForm();
            }}
            className="text-indigo-600 hover:underline font-medium focus:outline-none"
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
}

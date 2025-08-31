import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ handleLogout }) => {
  return (
    <header className="bg-white shadow-md py-4 mb-8 rounded-lg">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Company Name - replace logo as needed */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-full"></span>
          <span className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-wide">
            OMIND<span className="text-purple-600">.AI</span>
          </span>
        </div>
        {/* Navigation */}
        <nav className="flex gap-6 items-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-purple-600 text-lg font-medium transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/upload"
            className="text-blue-600 hover:text-purple-600 text-lg font-medium transition-colors"
          >
            Upload
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-lg shadow hover:from-pink-600 hover:to-red-500 transition"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route,  Navigate } from "react-router-dom";
import Login from "./components/Login";
import UploadForm from "./components/UploadForm";
import Dashboard from "./components/Dashboard";
import { getProfile, logout } from "./services/api";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await getProfile();
        setUser(res.data.user.username);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setRefreshData(false);
  };

  if (loading)
    return (
      <div className="text-center text-xl text-gray-600 mt-20">Loading…</div>
    );

  if (!user) return <Login onLogin={setUser} />;

  return (
    <BrowserRouter>
      <Navbar handleLogout={handleLogout} />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Dashboard key={refreshData} user={user} />} />
        <Route
          path="/upload"
          element={
            <UploadForm
              onUploadSuccess={() => setRefreshData((prev) => !prev)}
            />
          }
        />
        {/* Catch-all: redirect to Home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

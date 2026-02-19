// src/pages/Profile.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Agar backend mein /auth/me ya /users/me endpoint hai to use karo
        // Nahi to localStorage se fallback
        const data = await api("/auth/me"); // adjust endpoint as per your backend
        setUser(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setError("Profile load nahi hua");
        // Fallback to localStorage
        const stored = JSON.parse(localStorage.getItem("user")) || {
          name: "User",
          email: "user@email.com",
        };
        setUser(stored);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p className="p-8 text-center">Loading profile...</p>;

  if (!user) return <p className="p-8 text-red-600">No user data available</p>;

  return (
    <div className="p-8 bg-[#f7f8fa] min-h-screen">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-semibold text-gray-900">Profile</h1>
        <p className="text-gray-500 mt-1">Manage your account information</p>
        {error && <p className="mt-4 text-red-600">{error}</p>}
      </motion.div>

      <div className="mt-8 max-w-xl rounded-2xl bg-white border p-6 shadow-sm">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-medium">{user.name || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email || "N/A"}</p>
          </div>
          {/* Agar aur fields hain to yahaan add kar sakta hai */}
        </div>
      </div>
    </div>
  );
}
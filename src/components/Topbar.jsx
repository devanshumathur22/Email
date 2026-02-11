import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // token delete
    navigate("/login"); // redirect to login
     window.location.reload()   // 👈 important for clean reset
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 relative">
      {/* Left */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Email Sender
        </h2>
        <p className="text-xs text-gray-500">
          Campaign Manager
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
          title="Notifications"
        >
          🔔
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
              D
            </div>
            <span className="hidden sm:block text-sm text-gray-700">
              Devanshu
            </span>
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-md z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">Devanshu</p>
                <p className="text-xs text-gray-500">
                  devanshu@email.com
                </p>
              </div>

              <div className="py-1 text-sm">
                <button
                  onClick={() => navigate("/profile")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Settings
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

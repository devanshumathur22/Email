import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "🏠" },
  { label: "Compose", path: "/compose", icon: "✍️" },
  { label: "Campaigns", path: "/campaigns", icon: "📢" },
  { label: "Templates", path: "/templates", icon: "📄" },
  { label: "Queue", path: "/queue", icon: "🕒" },
  { label: "Contacts", path: "/contacts", icon: "👥" },
  { label: "Groups", path: "/groups", icon: "🗂️" },
  { label: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path) =>
    pathname === path || pathname.startsWith(path + "/");

  return (
    <aside
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-gray-900 text-white flex flex-col transition-all duration-300`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold">Email Sender</h1>
            <p className="text-xs text-gray-400">Campaign Manager</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white"
          title="Toggle sidebar"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              isActive(item.path)
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && (
              <span className="text-sm font-medium">
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-800 text-xs text-gray-400">
          v1.0 • UI Ready
        </div>
      )}
    </aside>
  );
}

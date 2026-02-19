
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Home,
    PenSquare,
    Megaphone,
    LayoutTemplate,
    Clock,
    Users,
    Folder,
    Settings,
    Menu,
    Plus
} from "lucide-react";

const NAV_ITEMS = [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Campaigns", path: "/campaigns", icon: Megaphone },
    { label: "Templates", path: "/templates", icon: LayoutTemplate },
    { label: "Queue", path: "/queue", icon: Clock },
    { label: "Contacts", path: "/contacts", icon: Users },
    { label: "Groups", path: "/groups", icon: Folder },
    { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (path: string) =>
        pathname === path || (path !== "/" && pathname.startsWith(path + "/"));

    return (
        <aside
            className={`${collapsed ? "w-20" : "w-64"} bg-[#f6f8fc] h-screen sticky top-0 flex flex-col transition-all duration-300 border-r border-gray-200 z-20`}
        >
            {/* Header / Logo */}
            <div className="h-16 flex items-center px-4 gap-4">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition"
                >
                    <Menu size={20} />
                </button>

                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_1x_r2.png" alt="Logo" className="h-6 opacity-80" />
                        {/* Fallback if image fails or for custom brand */}
                        {/* <span className="text-xl font-medium text-gray-600">GmailClone</span> */}
                    </div>
                )}
            </div>

            {/* Compose Button */}
            <div className="px-2 py-4">
                <Link
                    href="/compose"
                    className={`flex items-center gap-3 bg-[#c2e7ff] text-[#001d35] hover:shadow-md transition-all rounded-2xl p-4 w-fit ${collapsed ? "justify-center px-4" : "px-6"}`}
                >
                    <PenSquare size={24} />
                    {!collapsed && <span className="font-semibold">Compose</span>}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            title={collapsed ? item.label : ""}
                            className={`flex items-center gap-4 px-4 py-2.5 rounded-full transition-colors ${active
                                ? "bg-[#d3e3fd] text-[#001d35] font-semibold"
                                : "text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <item.icon size={20} className={active ? "text-[#001d35]" : "text-gray-600"} />
                            {!collapsed && (
                                <span className="text-sm">
                                    {item.label}
                                </span>
                            )}
                            {active && !collapsed && (
                                <span className="ml-auto text-xs font-bold"></span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

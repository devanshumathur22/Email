
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal, Settings, HelpCircle, Grip, Bell, LogOut } from "lucide-react";

export default function Topbar() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
        router.refresh();
    };

    return (
        <header className="h-16 bg-[#f6f8fc] flex items-center justify-between px-4 sticky top-0 z-10 w-full">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-auto">
                <div className="bg-[#eaf1fb] flex items-center px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow focus-within:bg-white focus-within:shadow-md">
                    <Search className="text-gray-500 mr-3" size={20} />
                    <input
                        type="text"
                        placeholder="Search mail"
                        className="bg-transparent outline-none w-full text-gray-900 placeholder-gray-500"
                    />
                    <button className="p-2 hover:bg-gray-200 rounded-full ml-2">
                        <SlidersHorizontal size={18} className="text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 pl-4">
                <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600" title="Help">
                    <HelpCircle size={24} />
                </button>
                <button
                    onClick={() => router.push("/settings")}
                    className="p-2 hover:bg-gray-200 rounded-full text-gray-600"
                    title="Settings"
                >
                    <Settings size={24} />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600" title="Apps">
                    <Grip size={24} />
                </button>

                <div className="relative ml-2">
                    <button
                        onClick={() => setOpen(!open)}
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-semibold text-lg hover:ring-4 hover:ring-gray-200 transition"
                    >
                        R
                    </button>

                    {open && (
                        <div className="absolute right-0 mt-2 w-72 bg-[#e9eef6] rounded-[28px] p-4 shadow-xl z-50 border border-gray-100 flex flex-col items-center">
                            <div className="text-center mb-4">
                                <div className="w-16 h-16 bg-purple-600 rounded-full text-white flex items-center justify-center text-3xl font-medium mx-auto mb-2">
                                    R
                                </div>
                                <p className="text-gray-800 font-semibold text-lg">Ritesh User</p>
                                <p className="text-gray-500 text-sm">user@example.com</p>
                            </div>

                            <button
                                onClick={() => router.push("/profile")}
                                className="border border-gray-400 text-gray-700 px-6 py-2 rounded-full hover:bg-gray-100 transition text-sm font-medium mb-4"
                            >
                                Manage your Account
                            </button>

                            <div className="w-full border-t border-gray-300 mb-4"></div>

                            <button
                                onClick={handleLogout}
                                className="bg-white hover:bg-gray-50 text-gray-800 border px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2"
                            >
                                <LogOut size={16} /> Sign out
                            </button>

                            <div className="mt-4 text-xs text-gray-500 flex gap-4">
                                <span>Privacy Policy</span>
                                <span>•</span>
                                <span>Terms of Service</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

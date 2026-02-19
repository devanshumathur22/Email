
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

export default function Profile() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await api("/auth/me");
                setUser(data);
            } catch (err: any) {
                console.error("Profile fetch error:", err);
                setError("Failed to load profile");

                // Fallback to localStorage if API fails (temporary measure)
                const stored = localStorage.getItem("user");
                if (stored) {
                    try {
                        setUser(JSON.parse(stored));
                    } catch { }
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
                <p className="text-gray-500 mt-1">Manage your account information</p>
            </motion.div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading profile...</div>
            ) : error && !user ? (
                <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100">
                    {error}
                </div>
            ) : (
                <div className="max-w-xl bg-white border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-32 relative">
                        <div className="absolute -bottom-10 left-8">
                            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                                    {user?.name?.[0]?.toUpperCase() || "U"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-14 p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Name</label>
                            <p className="text-xl font-semibold text-gray-900 mt-1">{user?.name || "N/A"}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Email</label>
                            <p className="text-xl font-semibold text-gray-900 mt-1">{user?.email || "N/A"}</p>
                        </div>

                        {user?.createdAt && (
                            <div>
                                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</label>
                                <p className="text-gray-700 mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 px-8 py-4 border-t">
                        <button
                            onClick={() => alert("Edit profile not implemented yet")}
                            className="text-indigo-600 font-medium hover:text-indigo-800"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

function CountUp({ value, duration = 800 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = Number(value) || 0;
        if (end === 0) {
            setCount(0);
            return;
        }

        const step = Math.max(1, Math.floor(end / (duration / 16)));

        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <>{count}</>;
}

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);

    const loadStats = async () => {
        try {
            const data = await api("/campaigns/stats/dashboard");
            setStats(data);
        } catch (err) {
            console.error("Failed to load dashboard stats:", err);
        }
    };

    useEffect(() => {
        loadStats();
        const i = setInterval(loadStats, 10000);
        return () => clearInterval(i);
    }, []);

    if (!stats) return <p className="p-6 text-gray-500">Loading Dashboard Stats...</p>;

    const sent = stats.emails?.success || 0;
    const failed = stats.emails?.failure || 0;

    const cards = [
        {
            title: "Total Campaigns",
            value: stats.totalCampaigns || 0,
            gradient: "from-indigo-500 to-blue-500",
        },
        {
            title: "Emails Sent",
            value: sent,
            gradient: "from-emerald-500 to-green-500",
        },
        {
            title: "Failed Emails",
            value: failed,
            gradient: "from-rose-500 to-red-500",
        },
    ];

    return (
        <div className="space-y-10 min-h-screen">
            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-semibold text-gray-900">
                    Dashboard Overview
                </h1>
                <p className="text-gray-500 mt-1">
                    Live email system overview (auto refresh enabled)
                </p>
            </motion.div>

            {/* STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((c, i) => (
                    <motion.div
                        key={c.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.04 }}
                        className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm"
                    >
                        <div
                            className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.gradient}`}
                        />
                        <div className="p-6">
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{c.title}</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                <CountUp value={c.value} />
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* DELIVERY SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-6">
                        Delivery Performance
                    </h3>

                    <div className="flex justify-between items-center">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium">Successful Sends</p>
                            <p className="text-4xl font-bold text-emerald-600 mt-2">
                                <CountUp value={sent} />
                            </p>
                        </div>

                        <div className="h-12 w-px bg-gray-100"></div>

                        <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium">Unsuccessful Sends</p>
                            <p className="text-4xl font-bold text-rose-600 mt-2">
                                <CountUp value={failed} />
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-2">
                            System Operations
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Email delivery queue is active. New campaigns will be processed in the next cron cycle.
                        </p>
                    </div>

                    <div className="mt-6 flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 text-sm font-semibold w-fit">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        Syncing every 10s
                    </div>
                </div>
            </div>
        </div>
    );
}

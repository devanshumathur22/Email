
"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import Button from "@/components/Button";

export default function Settings() {
    const [form, setForm] = useState({
        host: "smtp.gmail.com",
        port: "587",
        user: "",
        pass: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const saveSMTP = async () => {
        setLoading(true);
        setMessage(null);

        // Validation
        if (!form.host.trim() || !form.port.trim() || !form.user.trim() || !form.pass.trim()) {
            setMessage({
                type: "error",
                text: "Please fill all fields",
            });
            setLoading(false);
            return;
        }

        const payload = {
            host: form.host.trim(),
            port: Number(form.port.trim()),
            user: form.user.trim(),
            pass: form.pass.trim(),
        };

        try {
            await api("/smtp", {
                method: "POST",
                body: payload,
            });

            setMessage({
                type: "success",
                text: "✅ SMTP saved & verified!",
            });

            setForm({ ...form, pass: "" });
        } catch (err: any) {
            console.error("SMTP error:", err);
            setMessage({
                type: "error",
                text: err.message || "SMTP verification failed",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">SMTP Settings</h1>
                <p className="text-gray-500 mt-1">
                    Configure your email provider to start sending campaigns.
                </p>
            </div>

            <div className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
                {message && (
                    <div
                        className={`p-4 rounded-lg text-sm font-medium ${message.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">SMTP Host</label>
                        <input
                            name="host"
                            placeholder="smtp.gmail.com"
                            value={form.host}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Port</label>
                        <input
                            name="port"
                            type="number"
                            placeholder="587"
                            value={form.port}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Username (Email)</label>
                        <input
                            name="user"
                            placeholder="you@gmail.com"
                            value={form.user}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">App Password</label>
                        <input
                            name="pass"
                            type="password"
                            placeholder="••••••••••••"
                            value={form.pass}
                            onChange={handleChange}
                            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ⚠️ For Gmail, use an <b>App Password</b>, not your login password.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <Button
                        text={loading ? "Verifying..." : "Save & Verify SMTP"}
                        onClick={saveSMTP}
                        disabled={loading}
                    />
                </div>
            </div>
        </div>
    );
}

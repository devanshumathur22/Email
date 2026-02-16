
"use client";

import { useState, useRef } from "react";
import { api } from "@/lib/api";

export default function CsvUploadModal({ open, onClose, onImported }: { open: boolean, onClose: () => void, onImported?: () => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const fileRef = useRef<HTMLInputElement>(null);

    if (!open) return null;

    const upload = async () => {
        if (!file) {
            setError("Please select a CSV file");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            setError("");

            const res = await fetch("/api/contacts/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            if (onImported) onImported();
            onClose();
        } catch {
            setError("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4 shadow-xl">
                <h2 className="text-lg font-semibold text-gray-800">Import Contacts CSV</h2>

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => fileRef.current?.click()}>
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".csv"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                    />
                    {file ? (
                        <p className="text-gray-800 font-medium">{file.name}</p>
                    ) : (
                        <p className="text-gray-500">Click to upload CSV file</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={upload}
                        disabled={loading || !file}
                        className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Uploading..." : "Upload Contacts"}
                    </button>
                </div>
            </div>
        </div>
    );
}

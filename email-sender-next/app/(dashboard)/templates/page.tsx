
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import AITemplateGenerator from "@/components/AITemplateGenerator";
import { motion, AnimatePresence } from "framer-motion";
import AIPanel from "@/components/AIPanel";

export default function Templates() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [category, setCategory] = useState("all");
    const [showFav, setShowFav] = useState(false);

    const [editing, setEditing] = useState<any>(null);
    const [preview, setPreview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD ================= */
    const load = async () => {
        try {
            const data = await api("/templates");
            setTemplates(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /* ================= FILTERS ================= */
    const filtered = templates.filter((t) => {
        const matchCategory =
            category === "all" || t.category === category;
        const matchFav = !showFav || t.isFavorite;
        return matchCategory && matchFav;
    });

    /* ================= FAVORITE ================= */
    const toggleFav = async (id: string, current: boolean) => {
        // Optimistic update
        setTemplates(prev => prev.map(t => t._id === id ? { ...t, isFavorite: !current } : t));

        try {
            await api(`/templates/${id}/favorite`, { method: "PATCH" });
        } catch (err) {
            console.error(err);
            load(); // Revert on error
        }
    };

    /* ================= SAVE EDIT ================= */
    const saveEdit = async () => {
        try {
            await api(`/templates/${editing._id}`, {
                method: "PATCH",
                body: {
                    subject: editing.subject,
                    html: editing.html,
                },
            });

            setEditing(null);
            load();
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= A/B CLONE ================= */
    const cloneAB = async (id: string) => {
        try {
            await api(`/templates/${id}/clone`, { method: "POST" });
            load();
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= AI IMPROVE SUBJECT ================= */
    const improveSubject = async () => {
        try {
            const res = await api("/ai", {
                method: "POST",
                body: {
                    mode: "improve-subject",
                    subject: editing.subject,
                },
            });

            setEditing({
                ...editing,
                subject: res.subject,
            });
        } catch (err) {
            console.error(err);
        }
    };

    /* ================= USE TEMPLATE ================= */
    const useTemplate = (t: any) => {
        router.push(`/compose?templateId=${t._id}`);
    };

    return (
        <div className="space-y-6">
            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Templates</h1>

                <button
                    onClick={() => {
                        // Creating new template logic or modal? 
                        // For now, let's just use the AITemplateGenerator or add a manual create button if needed.
                        // The original link was <a href="/templates/new"> which implies a new page.
                        // I will create `app/(dashboard)/templates/new/page.tsx` separately if requested, or just keep it simple.
                        // Let's assume we use the builder or AI generator. 
                        alert("Use the AI Generator below to create new templates quickly!");
                    }}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition"
                >
                    + New Template
                </button>
            </div>

            {/* ================= FILTER BAR ================= */}
            <div className="flex gap-4">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                    <option value="all">All Categories</option>
                    <option value="promo">Promo</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="transactional">Transactional</option>
                </select>

                <button
                    onClick={() => setShowFav(!showFav)}
                    className={`px-4 py-2 rounded-lg border font-medium transition ${showFav ? "bg-yellow-100 border-yellow-300 text-yellow-800" : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                >
                    {showFav ? "★ Favorites" : "☆ Favorites"}
                </button>
            </div>

            {/* ================= AI TEMPLATE GENERATOR ================= */}
            <AITemplateGenerator />

            {/* ================= TEMPLATE GRID ================= */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading templates...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((t) => (
                        <div
                            key={t._id}
                            className="bg-white border rounded-xl p-5 hover:shadow-md transition space-y-4 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1 mr-2">
                                        <h3 className="font-semibold text-gray-800 truncate">{t.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">
                                            {t.subject}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => toggleFav(t._id, t.isFavorite)}
                                        className={`text-xl focus:outline-none ${t.isFavorite ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                                        title="Toggle Favorite"
                                    >
                                        ★
                                    </button>
                                </div>

                                {/* Preview logic could be adding a small iframe or just text */}
                            </div>

                            <div className="flex gap-2 text-sm flex-wrap mt-auto pt-4 border-t">
                                <button
                                    onClick={() => useTemplate(t)}
                                    className="flex-1 bg-indigo-50 text-indigo-700 py-1.5 rounded-md font-medium hover:bg-indigo-100 transition"
                                >
                                    Use
                                </button>

                                <button
                                    onClick={() => setEditing(t)}
                                    className="flex-1 bg-gray-50 text-gray-700 py-1.5 rounded-md hover:bg-gray-100 transition"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => setPreview(t)}
                                    className="flex-1 bg-gray-50 text-gray-700 py-1.5 rounded-md hover:bg-gray-100 transition"
                                >
                                    Preview
                                </button>

                                <button
                                    onClick={() => cloneAB(t._id)}
                                    className="px-2 text-purple-600 hover:bg-purple-50 rounded"
                                    title="Create A/B Test Variant"
                                >
                                    A/B
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && filtered.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No templates found matching your filters.
                        </div>
                    )}
                </div>
            )}

            {/* ================= PREVIEW MODAL ================= */}
            <AnimatePresence>
                {preview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                        onClick={() => setPreview(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b flex justify-between items-center">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    {preview.subject}
                                </h2>
                                <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-black">✕</button>
                            </div>

                            <div className="flex-1 overflow-auto p-6 bg-gray-50">
                                <div
                                    className="bg-white border shadow-sm p-8 mx-auto max-w-xl min-h-[300px]"
                                    dangerouslySetInnerHTML={{ __html: preview.html }}
                                />
                            </div>

                            <div className="p-4 border-t text-right bg-white rounded-b-xl">
                                <button
                                    onClick={() => setPreview(null)}
                                    className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ================= EDIT MODAL ================= */}
            <AnimatePresence>
                {editing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-xl flex flex-col shadow-2xl"
                        >
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Edit Template
                                </h2>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Subject Line</label>
                                    <div className="flex gap-2">
                                        <input
                                            value={editing.subject}
                                            onChange={(e) =>
                                                setEditing({
                                                    ...editing,
                                                    subject: e.target.value,
                                                })
                                            }
                                            className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                        <button
                                            onClick={improveSubject}
                                            className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium hover:bg-purple-200"
                                        >
                                            ✨ AI Improve
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700 block mb-1">Email Body (HTML)</label>
                                    <textarea
                                        value={editing.html}
                                        onChange={(e) =>
                                            setEditing({
                                                ...editing,
                                                html: e.target.value,
                                            })
                                        }
                                        className="w-full border p-2 h-64 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                <AIPanel
                                    subject={editing.subject}
                                    html={editing.html}
                                    onApply={(res: any) => {
                                        if (res.mode === "improve-subject") {
                                            setEditing({
                                                ...editing,
                                                subject: res.data.subject,
                                            });
                                        }

                                        if (res.mode === "subject-variants") {
                                            setEditing({
                                                ...editing,
                                                subject: res.data.variants[0],
                                            });
                                        }

                                        if (res.mode === "rewrite-body") {
                                            setEditing({
                                                ...editing,
                                                html: res.data.html,
                                            });
                                        }
                                    }}
                                />

                            </div>

                            <div className="p-6 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                                <button
                                    onClick={() => setEditing(null)}
                                    className="px-4 py-2 rounded-lg bg-white border hover:bg-gray-50 text-gray-700 font-medium"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={saveEdit}
                                    className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md transform active:scale-95 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

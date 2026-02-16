
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Button from "@/components/Button";
import EditQueueModal from "@/components/EditQueueModal";
import QueueRow from "@/components/QueueRow";

/* ================= PREVIEW MODAL ================= */
function QueuePreviewModal({ row, onClose }: { row: any; onClose: () => void }) {
    useEffect(() => {
        const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", esc);
        return () => window.removeEventListener("keydown", esc);
    }, [onClose]);

    if (!row) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white w-[700px] max-h-[80vh] overflow-y-auto rounded-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-xl font-semibold mb-3">Email Preview</h2>

                <p className="text-sm text-gray-600 mb-2">
                    <b>To:</b> {row.email}
                </p>

                <div className="border rounded p-3 mb-4">
                    <b>Subject:</b> {row.subject || "—"}
                </div>

                <div
                    className="prose max-w-none border rounded p-4"
                    dangerouslySetInnerHTML={{ __html: row.html || "" }}
                />

                <div className="text-right mt-6">
                    <Button text="Close" onClick={onClose} />
                </div>
            </div>
        </div>
    );
}

/* ================= MAIN PAGE ================= */
export default function Queue() {
    const router = useRouter();
    const [rows, setRows] = useState<any[]>([]);
    const [filter, setFilter] = useState("all");
    const [editingRow, setEditingRow] = useState<any>(null);
    const [previewRow, setPreviewRow] = useState<any>(null);
    const [selected, setSelected] = useState<string[]>([]);
    const [importMode, setImportMode] = useState("append");

    const fileRef = useRef<HTMLInputElement>(null);

    const normalize = (s: string) => s?.toUpperCase();

    /* ================= LOAD ================= */
    const load = async () => {
        try {
            const data = await api("/queue");
            setRows(Array.isArray(data) ? data : []);
        } catch {
            setRows([]);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /* ================= FILTER ================= */
    const filtered =
        filter === "all"
            ? rows
            : rows.filter((r) => normalize(r.status) === filter);

    /* ================= SELECTION ================= */
    const toggleRow = (id: string) => {
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const toggleAll = () => {
        if (selected.length === filtered.length) {
            setSelected([]);
        } else {
            setSelected(filtered.map((r) => r._id));
        }
    };

    const selectedRows = rows.filter((r) => selected.includes(r._id));

    const hasInvalidSelection = selectedRows.some(
        (r) => normalize(r.status) !== "DRAFT"
    );

    /* ================= ACTIONS ================= */

    const convertToCampaign = async () => {
        if (!selected.length) return alert("Select draft emails");

        if (hasInvalidSelection) return alert("Only DRAFT emails allowed");

        try {
            await api("/campaigns/convert-to-campaign", {
                method: "POST",
                body: { queueIds: selected },
            });

            alert("Campaign created 🚀");
            setSelected([]);
            load();
            router.push("/campaigns");
        } catch (err) {
            console.error(err);
            alert("Failed to convert");
        }
    };

    /* ===== CSV UPLOAD ===== */
    const handleUpload = () => {
        if (fileRef.current) {
            fileRef.current.click();
        }
    };

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            // Next.js API route for upload
            const res = await fetch(`/api/queue/upload?mode=${importMode}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            load();
        } catch (err) {
            console.error(err);
            alert("Upload failed");
        } finally {
            if (fileRef.current) fileRef.current.value = "";
        }
    };

    const deleteOne = async (id: string) => {
        if (!confirm("Delete email?")) return;
        try {
            await api(`/queue/${id}`, { method: "DELETE" });
            load();
        } catch (err) { console.error(err); }
    };

    const deleteMany = async () => {
        if (!selected.length) return;
        if (!confirm("Delete selected emails?")) return;

        try {
            await api("/queue/delete-many", {
                method: "POST",
                body: { ids: selected },
            });

            setSelected([]);
            load();
        } catch (err) { console.error(err); }
    };

    const saveEdit = async (data: any) => {
        try {
            await api(`/queue/${editingRow._id}`, {
                method: "PATCH",
                body: data,
            });
            setEditingRow(null);
            load();
        } catch (err) { console.error(err); }
    };

    /* ================= UI ================= */
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Email Queue</h1>

            {/* SUMMARY */}
            <div className="flex gap-6 items-center text-sm bg-white p-4 rounded-lg border shadow-sm">
                <div>📦 Total: <b>{rows.length}</b></div>
                <div>📝 Draft: <b>{rows.filter(r => normalize(r.status) === "DRAFT").length}</b></div>
                <div>✅ Selected: <b>{selected.length}</b></div>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border px-3 py-2 rounded ml-auto focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                    <option value="all">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="SENT">Sent</option>
                    <option value="FAILED">Failed</option>
                    <option value="CONVERTED">Converted</option>
                </select>
            </div>

            {/* ACTION BAR */}
            <div className="flex gap-3 flex-wrap items-center">
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={onFileChange}
                />

                <div className="flex items-center border rounded-lg overflow-hidden bg-white">
                    <span className="px-3 text-sm text-gray-500 bg-gray-50 border-r py-2">Import Mode</span>
                    <select
                        value={importMode}
                        onChange={(e) => setImportMode(e.target.value)}
                        className="px-3 py-2 outline-none text-sm"
                    >
                        <option value="append">Append</option>
                        <option value="replace">Replace All</option>
                    </select>
                </div>

                <Button text="Upload CSV" onClick={handleUpload} />

                {selected.length > 0 && (
                    <div className="flex gap-2">
                        <Button
                            text="Convert to Campaign"
                            onClick={convertToCampaign}
                            disabled={hasInvalidSelection}
                        />
                        <Button
                            variant="secondary"
                            text="Delete Selected"
                            onClick={deleteMany}
                        />
                    </div>
                )}
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-left">
                        <tr>
                            <th className="p-4 w-10">
                                <input
                                    type="checkbox"
                                    checked={
                                        filtered.length > 0 &&
                                        selected.length === filtered.length
                                    }
                                    onChange={toggleAll}
                                    className="rounded border-gray-300"
                                />
                            </th>
                            <th className="p-4 font-medium text-gray-600">Email</th>
                            <th className="p-4 font-medium text-gray-600">Subject</th>
                            <th className="p-4 font-medium text-gray-600">Status</th>
                            <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y">
                        {filtered.map((r) => (
                            <QueueRow
                                key={r._id}
                                row={r}
                                isSelected={selected.includes(r._id)}
                                onSelect={toggleRow}
                                onPreview={() => setPreviewRow(r)}
                                onEdit={() => setEditingRow(r)}
                                onDelete={() => deleteOne(r._id)}
                            />
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-gray-500">No items found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingRow && (
                <EditQueueModal
                    item={editingRow}
                    onClose={() => setEditingRow(null)}
                    onSave={saveEdit}
                />
            )}

            {previewRow && (
                <QueuePreviewModal
                    row={previewRow}
                    onClose={() => setPreviewRow(null)}
                />
            )}
        </div>
    );
}


"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Groups() {
    const [groups, setGroups] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showCreate, setShowCreate] = useState(false);
    const [editing, setEditing] = useState<any>(null);

    const [name, setName] = useState("");
    const [selectedContacts, setSelectedContacts] = useState(new Set());

    /* LOAD GROUPS */
    const load = async () => {
        try {
            const data = await api("/groups");
            setGroups(Array.isArray(data) ? data : []);
        } catch {
            setGroups([]);
        } finally {
            setLoading(false);
        }
    };

    const loadContacts = async () => {
        try {
            const data = await api("/contacts");
            setContacts(Array.isArray(data) ? data : []);
        } catch {
            setContacts([]);
        }
    };

    useEffect(() => {
        load();
        loadContacts();
    }, []);

    /* CREATE GROUP */
    const createGroup = async () => {
        if (!name.trim()) return alert("Group name required");

        try {
            await api("/groups", {
                method: "POST",
                body: { name },
            });

            setName("");
            setShowCreate(false);
            load();
        } catch (err) {
            console.error(err);
        }
    };

    /* START EDIT */
    const startEdit = (g: any) => {
        setEditing(g);
        setName(g.name);
        // Be careful with type of g.contacts elements (string ID or object)
        // Assuming API populates contacts, we need IDs.
        // If not populated, it is just IDs.
        // Let's assume populated based on original code usage.
        const ids = g.contacts?.map((c: any) => c._id || c) || [];
        setSelectedContacts(new Set(ids));
    };

    /* TOGGLE CONTACT */
    const toggleContact = (id: string) => {
        const s = new Set(selectedContacts);
        s.has(id) ? s.delete(id) : s.add(id);
        setSelectedContacts(s);
    };

    /* SAVE EDIT */
    const saveEdit = async () => {
        if (!name.trim()) return alert("Group name required");

        try {
            await api(`/groups/${editing._id}`, {
                method: "PATCH",
                body: { name },
            });

            await api(`/groups/${editing._id}/contacts`, {
                method: "PATCH",
                body: {
                    contactIds: Array.from(selectedContacts),
                },
            });

            setEditing(null);
            setName("");
            setSelectedContacts(new Set());
            load();
        } catch (err) {
            console.error(err);
        }
    };

    /* DELETE GROUP */
    const deleteGroup = async (id: string) => {
        if (!confirm("Delete this group?")) return;
        try {
            await api(`/groups/${id}`, { method: "DELETE" });
            load();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Groups</h1>
                    <p className="text-sm text-gray-500">Organize contacts</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-sm"
                >
                    + New Group
                </button>
            </div>

            {showCreate && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 shadow-xl">
                        <h2 className="text-lg font-semibold text-gray-800">Create Group</h2>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Group name"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createGroup}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loading ? (
                <p className="text-gray-500">Loading groups...</p>
            ) : groups.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border text-center text-gray-500 shadow-sm">
                    No groups created yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((g) => (
                        <div
                            key={g._id}
                            className="bg-white border rounded-xl p-5 hover:shadow-md transition flex flex-col justify-between h-48"
                        >
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 truncate">
                                    {g.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {g.contacts?.length || 0} members
                                </p>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                <button
                                    onClick={() => startEdit(g)}
                                    className="flex-1 bg-indigo-50 text-indigo-700 py-1.5 rounded-md font-medium hover:bg-indigo-100 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => deleteGroup(g._id)}
                                    className="flex-1 bg-red-50 text-red-700 py-1.5 rounded-md font-medium hover:bg-red-100 transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl max-h-[90vh] flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-800">Edit Group</h2>

                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Group Name"
                        />

                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                Assign Members ({selectedContacts.size})
                            </h3>
                            <div className="flex-1 overflow-y-auto border rounded-xl p-2 bg-gray-50">
                                {contacts.length === 0 ? (
                                    <p className="text-sm text-gray-500 p-2">No contacts available</p>
                                ) : (
                                    contacts.map((c) => (
                                        <label
                                            key={c._id}
                                            className="flex items-center gap-3 px-3 py-2 hover:bg-white rounded-lg cursor-pointer transition select-none"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedContacts.has(c._id)}
                                                onChange={() => toggleContact(c._id)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <span className="text-sm text-gray-700">{c.email}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => {
                                    setEditing(null);
                                    setName("");
                                    setSelectedContacts(new Set());
                                }}
                                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

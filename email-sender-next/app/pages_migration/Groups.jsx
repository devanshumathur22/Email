import { useEffect, useState } from "react"
import { api } from "../api"

export default function Groups() {
  const [groups, setGroups] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)

  const [name, setName] = useState("")
  const [selectedContacts, setSelectedContacts] = useState(new Set())

  /* LOAD GROUPS */
  const load = async () => {
    try {
      const data = await api("/groups")
      setGroups(Array.isArray(data) ? data : [])
    } catch {
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const loadContacts = async () => {
    const data = await api("/contacts")
    setContacts(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    load()
    loadContacts()
  }, [])

  /* CREATE GROUP */
  const createGroup = async () => {
    if (!name.trim()) return alert("Group name required")

    await api("/groups", {
      method: "POST",
      body: JSON.stringify({ name }),
    })

    setName("")
    setShowCreate(false)
    load()
  }

  /* START EDIT */
  const startEdit = (g) => {
    setEditing(g)
    setName(g.name)
    setSelectedContacts(new Set(g.contacts?.map((c) => c._id)))
  }

  /* TOGGLE CONTACT */
  const toggleContact = (id) => {
    const s = new Set(selectedContacts)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedContacts(s)
  }

  /* SAVE EDIT */
  const saveEdit = async () => {
    if (!name.trim()) return alert("Group name required")

    await api(`/groups/${editing._id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    })

    await api(`/groups/${editing._id}/contacts`, {
      method: "PATCH",
      body: JSON.stringify({
        contactIds: Array.from(selectedContacts),
      }),
    })

    setEditing(null)
    setName("")
    setSelectedContacts(new Set())
    load()
  }

  /* DELETE GROUP */
  const deleteGroup = async (id) => {
    if (!confirm("Delete this group?")) return
    await api(`/groups/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <>
      {/* CREATE GROUP MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[90%] md:w-[400px] p-6 space-y-4">
            <h2 className="text-lg font-semibold">Create Group</h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              className="w-full px-4 py-2 border rounded-lg"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 rounded bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={createGroup}
                className="px-4 py-2 rounded bg-indigo-600 text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className="p-4 md:p-8 space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Groups</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            + New Group
          </button>
        </div>

        {/* LIST */}
        <div className="bg-white border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-gray-400">
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="p-6 text-sm text-gray-400">
              No groups created yet
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Group Name</th>
                  <th>Contacts</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr key={g._id} className="border-t">
                    <td className="p-3 font-medium">{g.name}</td>
                    <td>{g.contacts?.length || 0}</td>
                    <td className="text-right p-3 space-x-3">
                      <button
                        onClick={() => startEdit(g)}
                        className="text-blue-600 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGroup(g._id)}
                        className="text-red-600 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[500px] space-y-4">
            <h2 className="font-semibold">Edit Group</h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />

            <div>
              <h3 className="text-sm font-medium mb-2">
                Assign Contacts
              </h3>
              <div className="max-h-[200px] overflow-y-auto border rounded">
                {contacts.map((c) => (
                  <label
                    key={c._id}
                    className="flex items-center gap-2 px-3 py-2 border-b text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(c._id)}
                      onChange={() => toggleContact(c._id)}
                    />
                    {c.email}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setEditing(null)
                  setName("")
                  setSelectedContacts(new Set())
                }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

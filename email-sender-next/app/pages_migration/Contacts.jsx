import { useState } from "react"
import CsvUploadModal from "./CsvUploadModal"
import AddContactModal from "../components/AddContactModal"

/* ================= GROUPS ================= */
const ALL_GROUPS = ["Job", "Marketing", "HR", "Worker"]

/* ================= DUMMY DATA ================= */
const DUMMY_CONTACTS = [
  {
    id: "1",
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    groups: ["Job"],
  },
  {
    id: "2",
    name: "Anjali Verma",
    email: "anjali@gmail.com",
    groups: ["Marketing"],
  },
]

export default function Contacts() {
  const [contacts, setContacts] = useState(DUMMY_CONTACTS)
  const [selected, setSelected] = useState([])
  const [search, setSearch] = useState("")
  const [groupFilter, setGroupFilter] = useState("All")

  const [showCsv, setShowCsv] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editContact, setEditContact] = useState(null)

  /* ================= FILTER ================= */
  const filtered = contacts.filter((c) => {
    const matchGroup =
      groupFilter === "All" || c.groups.includes(groupFilter)

    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())

    return matchGroup && matchSearch
  })

  /* ================= BULK ================= */
  const toggleAll = (checked) => {
    setSelected(checked ? filtered.map((c) => c.id) : [])
  }

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  const bulkDelete = () => {
    if (!selected.length) return
    if (!confirm(`Delete ${selected.length} contacts?`)) return

    setContacts((prev) =>
      prev.filter((c) => !selected.includes(c.id))
    )
    setSelected([])
  }

  /* ================= CRUD ================= */
  const deleteOne = (id) => {
    if (!confirm("Delete this contact?")) return
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  const addContact = (contact) => {
    // 🔒 duplicate email check
    if (contacts.some((c) => c.email === contact.email)) {
      alert("Email already exists")
      return
    }

    setContacts((prev) => [
      ...prev,
      { ...contact, id: Date.now().toString() },
    ])
  }

  const updateContact = (updated) => {
    // 🔒 duplicate email (edit case)
    const duplicate = contacts.find(
      (c) =>
        c.email === updated.email && c.id !== updated.id
    )
    if (duplicate) {
      alert("Email already exists")
      return
    }

    setContacts((prev) =>
      prev.map((c) =>
        c.id === updated.id ? updated : c
      )
    )
  }

  /* ================= CSV IMPORT ================= */
  const handleCsvImport = (rows) => {
    const existingEmails = new Set(
      contacts.map((c) => c.email)
    )

    const unique = rows
      .filter((r) => !existingEmails.has(r.email))
      .map((r) => ({
        ...r,
        id: Date.now().toString() + Math.random(),
      }))

    if (unique.length !== rows.length) {
      alert("⚠️ Duplicate emails skipped")
    }

    setContacts((prev) => [...prev, ...unique])
  }

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contacts</h1>
          <p className="text-sm text-gray-500">
            Manage recipients & groups
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCsv(true)}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Import CSV
          </button>
          <button
            onClick={() => {
              setEditContact(null)
              setShowModal(true)
            }}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Add Contact
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Total Contacts" value={contacts.length} />
        <Stat label="Groups" value={ALL_GROUPS.length} />
        <Stat label="Selected" value={selected.length} />
      </div>

      {/* FILTER */}
      <div className="flex flex-col md:flex-row gap-4">
        <input
          className="px-4 py-2 border rounded w-full md:w-72"
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="px-4 py-2 border rounded w-full md:w-48"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
        >
          <option>All</option>
          {ALL_GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        {selected.length > 0 && (
          <button
            onClick={bulkDelete}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Delete Selected
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={
                    selected.length === filtered.length &&
                    filtered.length > 0
                  }
                  onChange={(e) =>
                    toggleAll(e.target.checked)
                  }
                />
              </th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Groups</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(c.id)}
                    onChange={() => toggleOne(c.id)}
                  />
                </td>
                <td className="px-4 py-3">{c.name}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3 space-x-1">
                  {c.groups.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700"
                    >
                      {g}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => {
                      setEditContact(c)
                      setShowModal(true)
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteOne(c.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="py-6 text-center text-gray-500"
                >
                  No contacts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      <CsvUploadModal
        open={showCsv}
        onClose={() => setShowCsv(false)}
        onImported={handleCsvImport}
      />

      <AddContactModal
        open={showModal}
        contact={editContact}
        groups={ALL_GROUPS}
        onClose={() => setShowModal(false)}
        onAdd={addContact}
        onUpdate={updateContact}
      />
    </div>
  )
}

/* ================= STAT ================= */
function Stat({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

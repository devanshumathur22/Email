import { useEffect, useState } from "react"

/* 🔥 EXISTING TAG GROUPS (UNCHANGED) */
const GROUPS = ["General", "Job", "Marketing", "Clients", "HR"]

export default function AddContactModal({
  open,
  onClose,
  onAdd,
  onUpdate,
  contact,
  groups = [], // future-proof, abhi unused
}) {
  const isEdit = !!contact

  const [form, setForm] = useState({
    name: "",
    email: "",
    tag: "General",
    groups: [], // 🔥 MULTI GROUP SUPPORT
  })

  /* LOAD DATA FOR EDIT */
  useEffect(() => {
    if (contact) {
      setForm({
        name: contact.name || "",
        email: contact.email || "",
        tag: contact.tag || "General",
        groups: contact.groups || [],
      })
    } else {
      setForm({
        name: "",
        email: "",
        tag: "General",
        groups: [],
      })
    }
  }, [contact, open])

  if (!open) return null

  /* TOGGLE GROUP */
  const toggleGroup = (group) => {
    setForm((prev) => ({
      ...prev,
      groups: prev.groups.includes(group)
        ? prev.groups.filter((g) => g !== group)
        : [...prev.groups, group],
    }))
  }

  /* SUBMIT */
  const submit = () => {
    if (!form.name || !form.email) {
      alert("Name & Email required")
      return
    }

    if (isEdit) {
      onUpdate(form)
    } else {
      onAdd({
        ...form,
        id: Date.now().toString(),
      })
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Contact" : "Add Contact"}
        </h2>

        {/* NAME */}
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        {/* EMAIL */}
        <input
          className="w-full px-3 py-2 border rounded"
          placeholder="Email"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        {/* OLD TAG (UNCHANGED) */}
        <select
          className="w-full px-3 py-2 border rounded"
          value={form.tag}
          onChange={(e) =>
            setForm({ ...form, tag: e.target.value })
          }
        >
          {GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>

        {/* 🔥 MULTI GROUP ASSIGN */}
        <div>
          <p className="text-sm font-medium mb-2">
            Assign Groups
          </p>

          <div className="flex flex-wrap gap-2">
            {GROUPS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGroup(g)}
                className={`px-3 py-1 text-xs rounded border ${
                  form.groups.includes(g)
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-50"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            {isEdit ? "Save Changes" : "Add Contact"}
          </button>
        </div>
      </div>
    </div>
  )
}

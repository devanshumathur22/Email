import { useEffect, useState } from "react"

export default function AddContactModal({
  open,
  onClose,
  onAdd,
  onUpdate,
  contact,
  groups = [],
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [selectedGroups, setSelectedGroups] = useState([])
  const [error, setError] = useState("")

  /* PREFILL (EDIT MODE) */
  useEffect(() => {
    if (contact) {
      setName(contact.name || "")
      setEmail(contact.email || "")
      setSelectedGroups(contact.groups || [])
    } else {
      setName("")
      setEmail("")
      setSelectedGroups([])
    }
    setError("")
  }, [contact, open])

  if (!open) return null

  const toggleGroup = (g) => {
    setSelectedGroups((prev) =>
      prev.includes(g)
        ? prev.filter((x) => x !== g)
        : [...prev, g]
    )
  }

  const submit = () => {
    if (!name || !email) {
      setError("Name and Email are required")
      return
    }

    if (selectedGroups.length === 0) {
      setError("Select at least one group")
      return
    }

    const payload = {
      id: contact?.id,
      name,
      email,
      groups: selectedGroups,
    }

    contact ? onUpdate(payload) : onAdd(payload)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">
          {contact ? "Edit Contact" : "Add Contact"}
        </h2>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* NAME */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* EMAIL */}
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={!!contact} // email immutable in edit
        />

        {/* GROUPS */}
        <div>
          <p className="text-sm font-medium mb-2">Groups</p>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => toggleGroup(g)}
                className={`px-3 py-1 rounded text-sm border ${
                  selectedGroups.includes(g)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {contact ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"

export default function ContactSelector({ onSelect, onClose }) {
  const [contacts, setContacts] = useState([])
  const [groups, setGroups] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const [selectedContacts, setSelectedContacts] = useState(new Set())
  const [selectedGroups, setSelectedGroups] = useState(new Set())

  // 🔥 ADD: group expand state
  const [expandedGroup, setExpandedGroup] = useState(null)

  /* ================= LOAD ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const c = await api("/contacts")
        const g = await api("/groups")

        setContacts(Array.isArray(c) ? c : [])
        setGroups(Array.isArray(g) ? g : [])
      } catch (e) {
        console.error("ContactSelector load error", e)
        setContacts([])
        setGroups([])
      } finally {
        setLoading(false)
      }
    }

    load()

    const esc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  /* ================= TOGGLE ================= */
  const toggleContact = (id) => {
    const s = new Set(selectedContacts)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedContacts(s)
  }

  const toggleGroup = (id) => {
    const s = new Set(selectedGroups)
    s.has(id) ? s.delete(id) : s.add(id)
    setSelectedGroups(s)
  }

  /* ================= FILTER ================= */
  const filteredContacts = contacts.filter((c) =>
    c.email?.toLowerCase().includes(search.toLowerCase())
  )

  /* ================= SUBMIT ================= */
  const submit = () => {
    onSelect({
      contactIds: Array.from(selectedContacts),
      groupIds: Array.from(selectedGroups),
    })

    setSelectedContacts(new Set())
    setSelectedGroups(new Set())
    setExpandedGroup(null)
  }

  /* ================= UI ================= */
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl w-[95%] md:w-[900px] max-h-[90vh] flex flex-col shadow-xl"
        >
          {/* HEADER */}
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Recipients
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-black text-xl"
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="p-6 space-y-5 overflow-y-auto">
            {/* SEARCH */}
            <input
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 bg-white"
            />

            {/* GROUPS */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-900">
                Groups
              </h3>

              <div className="space-y-2">
                {groups.map((g) => (
                  <div
                    key={g._id}
                    className="border rounded-lg"
                  >
                    {/* GROUP HEADER */}
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedGroups.has(g._id)}
                          onChange={() => toggleGroup(g._id)}
                        />
                        <span className="font-medium text-sm text-gray-900">
                          {g.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({g.contacts?.length || 0})
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedGroup(
                            expandedGroup === g._id
                              ? null
                              : g._id,
                          )
                        }
                        className="text-xs text-indigo-600"
                      >
                        {expandedGroup === g._id
                          ? "Hide"
                          : "View"}
                      </button>
                    </div>

                    {/* GROUP CONTACTS */}
                    {expandedGroup === g._id && (
                      <div className="max-h-[200px] overflow-y-auto">
                        {g.contacts?.length ? (
                          g.contacts.map((c) => (
                            <label
                              key={c._id}
                              className="flex items-center gap-3 px-4 py-2 border-t text-sm cursor-pointer hover:bg-gray-50"
                            >
                              <input
                                type="checkbox"
                                checked={selectedContacts.has(c._id)}
                                onChange={() =>
                                  toggleContact(c._id)
                                }
                              />
                              <div>
                                <div className="text-gray-900">{c.email}</div>
                                {c.name && (
                                  <div className="text-xs text-gray-400">
                                    {c.name}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-xs text-gray-400">
                            No contacts in this group
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ALL CONTACTS */}
            <div>
              <h3 className="text-sm font-semibold mb-2 text-gray-900">
                All Contacts
              </h3>

              <div className="border rounded-lg max-h-[250px] overflow-y-auto">
                {filteredContacts.map((c) => (
                  <label
                    key={c._id}
                    className="flex items-center gap-3 px-4 py-2 border-b cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(c._id)}
                      onChange={() => toggleContact(c._id)}
                    />
                    <div>
                      <div className="text-sm text-gray-900">{c.email}</div>
                      {c.name && (
                        <div className="text-xs text-gray-400">
                          {c.name}
                        </div>
                      )}
                    </div>
                  </label>
                ))}

                {filteredContacts.length === 0 && (
                  <div className="px-4 py-6 text-sm text-gray-400 text-center">
                    No contacts found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t flex justify-between items-center bg-gray-50">
            <div className="text-sm text-gray-500">
              Selected:{" "}
              {selectedContacts.size +
                selectedGroups.size}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-white border text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={
                  selectedContacts.size === 0 &&
                  selectedGroups.size === 0
                }
                className="px-5 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

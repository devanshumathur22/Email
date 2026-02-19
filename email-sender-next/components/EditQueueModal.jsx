import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

export default function EditQueueModal({ item, onSave, onClose }) {
  const boxRef = useRef(null)

  /* 🔒 GUARD — item undefined ho to render hi mat karo */
  if (!item) return null

  const [form, setForm] = useState({
    email: "",
    subject: "",
    body: "",
    footer: "",
  })

  /* 🧠 HYDRATE FORM (SAFE) */
  useEffect(() => {
    setForm({
      email: item.email || "",
      subject: item.subject || "",
      body: item.body || item.body_html || item.html || "",
      footer: item.footer || "",
    })
  }, [item])

  /* ESC to close */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  /* Outside click close */
  const handleOutside = (e) => {
    if (boxRef.current && !boxRef.current.contains(e.target)) {
      onClose()
    }
  }

  const update = (key, value) =>
    setForm((p) => ({ ...p, [key]: value }))

  const isInvalid = !form.email.trim() || !form.subject.trim()

  const save = () => {
    if (isInvalid) return
    onSave(form)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onMouseDown={handleOutside}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        ref={boxRef}
        onMouseDown={(e) => e.stopPropagation()}
        className="bg-white rounded-xl w-[600px] max-h-[85vh] overflow-y-auto p-6"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
      >
        <h2 className="text-lg font-semibold mb-5">
          Edit Queue Email
        </h2>

        {/* Email */}
        <label className="text-sm font-medium">Email *</label>
        <input
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        {/* Subject */}
        <label className="text-sm font-medium">Subject *</label>
        <input
          value={form.subject}
          onChange={(e) => update("subject", e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        {/* Body */}
        <label className="text-sm font-medium">
          Email Body (HTML allowed)
        </label>
        <textarea
          rows={7}
          value={form.body}
          onChange={(e) => update("body", e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4 font-mono text-sm"
          placeholder="<p>Hello user...</p>"
        />

        {/* Footer */}
        <label className="text-sm font-medium">
          Footer (optional)
        </label>
        <textarea
          rows={3}
          value={form.footer}
          onChange={(e) => update("footer", e.target.value)}
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Unsubscribe / signature etc"
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={save}
            disabled={isInvalid}
            className={`px-4 py-2 rounded text-sm text-white ${
              isInvalid
                ? "bg-indigo-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

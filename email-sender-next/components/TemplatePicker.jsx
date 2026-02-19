import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { motion, AnimatePresence } from "framer-motion"

export default function TemplatePicker({ onSelect, onClose }) {
  const [templates, setTemplates] = useState([])
  const [preview, setPreview] = useState(null)
  const [category, setCategory] = useState("all")

  useEffect(() => {
    api("/templates").then(setTemplates)
  }, [])

  const filtered =
    category === "all"
      ? templates
      : templates.filter((t) => t.category === category)

  return (
    <>
      {/* ================= PICKER ================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl w-[720px] p-6"
        >
          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Choose Template
            </h2>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border px-3 py-1 rounded text-sm"
            >
              <option value="all">All</option>
              <option value="promo">Promo</option>
              <option value="newsletter">Newsletter</option>
              <option value="transactional">Transactional</option>
            </select>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-2 gap-4 max-h-[420px] overflow-auto">
            {filtered.map((t) => (
              <div
                key={t._id}
                className="border rounded-xl p-4 hover:shadow space-y-2"
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{t.name}</h3>
                  {t.isFavorite && (
                    <span className="text-yellow-500">★</span>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  {t.subject}
                </p>

                <div className="flex gap-3 text-sm">
                  <button
                    onClick={() => onSelect(t)}
                    className="text-indigo-600"
                  >
                    Use →
                  </button>

                  <button
                    onClick={() => setPreview(t)}
                    className="text-gray-600"
                  >
                    Preview
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="text-right mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-100"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* ================= PREVIEW MODAL ================= */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white w-[600px] rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-2">
                {preview.subject}
              </h3>

              <div
                className="border p-4 rounded text-sm"
                dangerouslySetInnerHTML={{
                  __html: preview.html,
                }}
              />

              <div className="text-right mt-4">
                <button
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 rounded bg-gray-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

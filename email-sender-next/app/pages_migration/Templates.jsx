import { useEffect, useState } from "react"
import { api } from "../api"
import AITemplateGenerator from "../components/AITemplateGenerator"
import { motion, AnimatePresence } from "framer-motion"
import AIPanel from "../components/AIPanel"
import { useNavigate } from "react-router-dom"

export default function Templates() {
  const [templates, setTemplates] = useState([])
  const [category, setCategory] = useState("all")
  const [showFav, setShowFav] = useState(false)

  const [editing, setEditing] = useState(null)
  const [preview, setPreview] = useState(null)

  const navigate = useNavigate()

  /* ================= LOAD ================= */
  const load = () => {
    api("/templates").then(setTemplates)
  }

  useEffect(() => {
    load()
  }, [])

  /* ================= FILTERS ================= */
  const filtered = templates.filter((t) => {
    const matchCategory =
      category === "all" || t.category === category
    const matchFav = !showFav || t.isFavorite
    return matchCategory && matchFav
  })

  /* ================= FAVORITE ================= */
  const toggleFav = async (id) => {
    await api(`/templates/${id}/favorite`, { method: "PATCH" })
    load()
  }

  /* ================= SAVE EDIT ================= */
  const saveEdit = async () => {
    await api(`/templates/${editing._id}`, {
      method: "PATCH",
      body: JSON.stringify({
        subject: editing.subject,
        html: editing.html,
      }),
    })

    setEditing(null)
    load()
  }

  /* ================= A/B CLONE ================= */
  const cloneAB = async (id) => {
    await api(`/templates/${id}/clone`, { method: "POST" })
    load()
  }

  /* ================= AI IMPROVE SUBJECT ================= */
  const improveSubject = async () => {
    const res = await api("/ai", {
      method: "POST",
      body: JSON.stringify({
        mode: "improve-subject",
        subject: editing.subject,
      }),
    })

    setEditing({
      ...editing,
      subject: res.subject,
    })
  }

  /* ================= USE TEMPLATE (✅ ADDED) ================= */
  const useTemplate = (t) => {
    navigate("/compose", {
      state: {
        fromTemplate: true,
        templateId: t._id,
        subject: t.subject,
        html: t.html,
        footer: t.footer || "",
      },
    })
  }

  return (
    <div className="p-8 bg-[#f7f8fa] min-h-screen space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Templates</h1>

        <a
          href="/templates/new"
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm"
        >
          + New Template
        </a>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex gap-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded border"
        >
          <option value="all">All</option>
          <option value="promo">Promo</option>
          <option value="newsletter">Newsletter</option>
          <option value="transactional">Transactional</option>
        </select>

        <button
          onClick={() => setShowFav(!showFav)}
          className={`px-3 py-2 rounded border ${
            showFav ? "bg-yellow-100" : ""
          }`}
        >
          ⭐ Favorites
        </button>
      </div>

      {/* ================= AI TEMPLATE GENERATOR ================= */}
      <AITemplateGenerator />

      {/* ================= TEMPLATE GRID ================= */}
      <div className="grid grid-cols-3 gap-6">
        {filtered.map((t) => (
          <div
            key={t._id}
            className="bg-white border rounded-xl p-5 hover:shadow space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-xs text-gray-500">
                  {t.subject}
                </p>
              </div>

              <button
                onClick={() => toggleFav(t._id)}
                className="text-yellow-500 text-lg"
              >
                {t.isFavorite ? "★" : "☆"}
              </button>
            </div>

            <div className="flex gap-3 text-sm flex-wrap">
              <button
                onClick={() => useTemplate(t)}
                className="text-indigo-600 font-medium"
              >
                Use
              </button>

              <button
                onClick={() => setEditing(t)}
                className="text-blue-600"
              >
                Edit
              </button>

              <button
                onClick={() => setPreview(t)}
                className="text-gray-600"
              >
                Preview
              </button>

              <button
                onClick={() => cloneAB(t._id)}
                className="text-purple-600"
              >
                A/B
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ================= PREVIEW MODAL ================= */}
      <AnimatePresence>
        {preview && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div className="bg-white w-[600px] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-3">
                {preview.subject}
              </h2>

              <div
                className="border rounded p-4 text-sm"
                dangerouslySetInnerHTML={{ __html: preview.html }}
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

      {/* ================= EDIT MODAL ================= */}
      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <motion.div className="bg-white w-[560px] p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-semibold">
                Edit Template
              </h2>

              <input
                value={editing.subject}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    subject: e.target.value,
                  })
                }
                className="w-full border p-2 rounded"
              />

              <textarea
                value={editing.html}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    html: e.target.value,
                  })
                }
                className="w-full border p-2 h-40 rounded"
              />

              <AIPanel
                subject={editing.subject}
                html={editing.html}
                onApply={(res) => {
                  if (res.mode === "improve-subject") {
                    setEditing({
                      ...editing,
                      subject: res.data.subject,
                    })
                  }

                  if (res.mode === "subject-variants") {
                    setEditing({
                      ...editing,
                      subject: res.data.variants[0],
                    })
                  }

                  if (res.mode === "rewrite-body") {
                    setEditing({
                      ...editing,
                      html: res.data.html,
                    })
                  }
                }}
              />

              <div className="flex justify-between items-center">
                <button
                  onClick={improveSubject}
                  className="px-3 py-1 rounded bg-purple-600 text-white text-sm"
                >
                  ✨ AI Improve Subject
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-3 py-1"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={saveEdit}
                    className="px-4 py-1 rounded bg-indigo-600 text-white"
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

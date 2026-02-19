import { useState } from "react"
import { api } from "../api"
import { motion } from "framer-motion"

export default function TemplateBuilder() {
  const [name, setName] = useState("")
  const [subject, setSubject] = useState("")
  const [html, setHtml] = useState("")

  const save = async () => {
    if (!name || !subject || !html) {
      alert("All fields required")
      return
    }

    await api("/templates", {
      method: "POST",
      body: JSON.stringify({ name, subject, html }),
    })

    alert("Template saved ✅")
    setName("")
    setSubject("")
    setHtml("")
  }

  return (
    <div className="p-8 bg-[#f7f8fa] min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">
        Template Builder
      </h1>

      <div className="grid grid-cols-2 gap-6">
        {/* FORM */}
        <div className="bg-white rounded-xl border p-6 space-y-4">
          <input
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded border"
          />

          <input
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-4 py-2 rounded border"
          />

          <textarea
            placeholder="HTML content"
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            rows={10}
            className="w-full px-4 py-2 rounded border font-mono text-sm"
          />

          <button
            onClick={save}
            className="px-4 py-2 rounded bg-indigo-600 text-white"
          >
            Save Template
          </button>
        </div>

        {/* LIVE PREVIEW */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl border p-6"
        >
          <h2 className="font-semibold mb-3">Live Preview</h2>

          <div
            className="border rounded p-4 text-sm"
            dangerouslySetInnerHTML={{
              __html: html || "<p>Start typing HTML…</p>",
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

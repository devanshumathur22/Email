import { useState } from "react"
import { api } from "../api"

export default function CsvUploadModal({ open, onClose }) {
  const [file, setFile] = useState(null)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!open) return null

  const upload = async () => {
    if (!file || !subject || !body) {
      setError("CSV, Subject and Body are required")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("subject", subject)
    formData.append("body", body)

    try {
      setLoading(true)
      setError("")
      await api("/campaigns/upload", {
        method: "POST",
        body: formData,
        isFormData: true,
      })
      onClose(true)
    } catch {
      setError("Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Import CSV</h2>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border p-2 rounded"
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded h-28"
          placeholder="Email body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={() => onClose(false)}
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            onClick={upload}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload & Schedule"}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { api } from "@/lib/api"

export default function AITemplateGenerator({ onUse }) {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!prompt) return
    setLoading(true)

    // future: backend AI call
    const res = await api("/templates/ai", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    })

    setLoading(false)
    onUse(res)
  }

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <h3 className="font-semibold">🧠 AI Template Generator</h3>

      <textarea
        placeholder="e.g. Promotional email for winter sale"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full border rounded p-2 text-sm"
      />

      <button
        onClick={generate}
        disabled={loading}
        className="px-3 py-2 bg-indigo-600 text-white rounded text-sm"
      >
        {loading ? "Generating..." : "Generate Template"}
      </button>
    </div>
  )
}

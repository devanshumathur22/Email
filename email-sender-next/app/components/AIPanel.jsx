import { useState } from "react"
import { api } from "../api"

export default function AIPanel({ subject, html, onApply }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const callAI = async (mode, extra = {}) => {
    setLoading(true)
    const res = await api("/ai", {
      method: "POST",
      body: JSON.stringify({
        mode,
        subject,
        html,
        ...extra,
      }),
    })
    setResult({ mode, data: res })
    setLoading(false)
  }

  return (
    <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
      <h3 className="font-semibold">✨ AI Assistant</h3>

      <div className="flex flex-wrap gap-2 text-sm">
        <button onClick={() => callAI("improve-subject")} className="btn">
          Improve Subject
        </button>

        <button onClick={() => callAI("subject-variants")} className="btn">
          A/B/C Subjects
        </button>

        <button onClick={() => callAI("spam-check")} className="btn">
          Spam Score
        </button>

        <button
          onClick={() =>
            callAI("rewrite-body", { tone: "professional" })
          }
          className="btn"
        >
          Rewrite Body
        </button>

        <button onClick={() => callAI("emoji-optimize")} className="btn">
          Emoji Optimizer
        </button>
      </div>

      {/* RESULT */}
      {loading && <p className="text-xs">AI thinking… 🤖</p>}

      {result && (
        <div className="text-xs bg-white p-3 rounded border">
          <pre>{JSON.stringify(result.data, null, 2)}</pre>

          <button
            onClick={() => onApply(result)}
            className="mt-2 px-3 py-1 rounded bg-indigo-600 text-white"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}

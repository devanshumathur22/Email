import { useState } from "react"
import { api } from "../api"
import TemplatePicker from "../components/TemplatePicker"
import AIPanel from "../components/AIPanel"

export default function CampaignCreate() {
  const [subject, setSubject] = useState("")
  const [html, setHtml] = useState("")
  const [to, setTo] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)

  // 🔥 TEMPLATE → CAMPAIGN AUTO-FILL
  const onUseTemplate = (t) => {
    setSubject(t.subject)
    setHtml(t.html)
    setShowTemplates(false)
  }

  // 🚀 SEND CAMPAIGN
  const sendCampaign = async () => {
    await api("/campaigns", {
      method: "POST",
      body: JSON.stringify({
        to,
        subject,
        html,
        sendNow: true,
      }),
    })

    alert("Campaign sent 🚀")
  }

  return (
    <div className="p-8 bg-[#f7f8fa] min-h-screen space-y-6">
      <h1 className="text-3xl font-semibold">
        Create Campaign
      </h1>

      {/* RECIPIENTS */}
      <input
        placeholder="Recipients (comma separated)"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="w-full border p-3 rounded"
      />

      {/* SUBJECT */}
      <input
        placeholder="Email subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full border p-3 rounded"
      />

      {/* BODY */}
      <textarea
        placeholder="Email body (HTML allowed)"
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        className="w-full border p-3 rounded h-60"
      />

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowTemplates(true)}
          className="px-4 py-2 rounded bg-indigo-600 text-white"
        >
          Use Template
        </button>

        <button
          onClick={sendCampaign}
          className="px-4 py-2 rounded bg-green-600 text-white"
        >
          Send Now
        </button>
      </div>

      {/* 🧠 AI PANEL */}
      <AIPanel
        subject={subject}
        html={html}
        onSubjectChange={setSubject}
        onHtmlChange={setHtml}
      />

      {/* TEMPLATE PICKER */}
      {showTemplates && (
        <TemplatePicker
          onSelect={onUseTemplate}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>
  )
}

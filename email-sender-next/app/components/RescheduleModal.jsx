import { useState } from "react"
import { api } from "../api"

export default function RescheduleModal({ campaignId, onClose, onDone }) {
  const [date, setDate] = useState("")

  const submit = async () => {
    if (!date) {
      alert("Select date & time")
      return
    }

    await api(`/campaigns/${campaignId}/reschedule`, {
      method: "POST",
      body: JSON.stringify({
        scheduledAt: new Date(date).toISOString(),
      }),
    })

    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">
          Reschedule Campaign
        </h2>

        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"

export default function CampaignScheduleModal({
  campaign,
  onClose,
  onSave,
}) {
  const [time, setTime] = useState("")

  const submit = () => {
    if (!time) return alert("Select date & time")
    onSave({ time })
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[420px] rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4">
          Schedule Campaign
        </h2>

        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-6"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  )
}

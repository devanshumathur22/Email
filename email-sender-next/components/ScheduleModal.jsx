import { useState } from "react"
import Button from "./Button"

export default function ScheduleModal({ open, onClose, onDone }) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  if (!open) return null

  const submit = () => {
    if (!date || !time) {
      alert("Select date & time")
      return
    }

    const scheduledAt = new Date(`${date}T${time}`)
    onDone({ scheduledAt }) // ✅ ONLY THIS
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[320px] space-y-4">
        <h2 className="text-lg font-semibold">Schedule Email</h2>

        <input
          type="date"
          className="border p-2 rounded w-full"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          className="border p-2 rounded w-full"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <div className="flex justify-end gap-2 pt-3">
          <Button text="Cancel" variant="secondary" onClick={onClose} />
          <Button text="Schedule" onClick={submit} />
        </div>
      </div>
    </div>
  )
}

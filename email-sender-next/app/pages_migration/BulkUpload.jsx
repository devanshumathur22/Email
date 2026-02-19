import { useState } from "react"
import { api } from "../api"

export default function BulkUpload() {
  const [file, setFile] = useState(null)
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [loading, setLoading] = useState(false)

  const upload = async (status) => {
    if (!file) return alert("CSV required")

    const form = new FormData()
    form.append("file", file)
    form.append("subject", subject)
    form.append("body", body)
    form.append("status", status)

    setLoading(true)
    await api("/campaigns/bulk", {
      method: "POST",
      body: form,
      isForm: true,
    })

    setLoading(false)
    alert("Bulk campaign created")
  }

  return (
    <div className="space-y-4 max-w-xl">
      <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} />
      <input placeholder="Subject" onChange={e => setSubject(e.target.value)} />
      <textarea placeholder="Email body" onChange={e => setBody(e.target.value)} />

      <button onClick={() => upload("sent")}>Send Now</button>
      <button onClick={() => upload("draft")}>Save Draft</button>
    </div>
  )
}

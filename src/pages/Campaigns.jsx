import { useEffect, useState } from "react"
import { api } from "../api"
import CampaignRow from "../components/CampaignRow"
import ContactSelector from "../components/ContactSelector"
import TemplatePicker from "../components/TemplatePicker"
import CampaignAnalytics from "../components/CampaignAnalytics"
import CampaignPreviewModal from "../components/CampaignPreviewModal"
import CampaignScheduleModal from "../components/CampaignScheduleModal"



/* ================= MAIN ================= */
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [openMenu, setOpenMenu] = useState(null)

  const [showTemplates, setShowTemplates] = useState(false)
  const [previewCampaign, setPreviewCampaign] = useState(null)
  const [analyticsCampaign, setAnalyticsCampaign] = useState(null)

  const [showContacts, setShowContacts] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [scheduleCampaign, setScheduleCampaign] = useState(null)

  /* ================= LOAD ================= */
  const load = async () => {
    const data = await api("/campaigns")
    setCampaigns(Array.isArray(data) ? data : [])
  }

  useEffect(() => {
    load()
  }, [])

  // 🔥 auto refresh ONLY when no modal is open
  useEffect(() => {
    if (
      previewCampaign ||
      analyticsCampaign ||
      showContacts ||
      scheduleCampaign
    )
      return

    const i = setInterval(load, 5000)
    return () => clearInterval(i)
  }, [previewCampaign, analyticsCampaign, showContacts, scheduleCampaign])

  // 🔥 outside click close menu
  useEffect(() => {
    const close = () => setOpenMenu(null)
    window.addEventListener("click", close)
    return () => window.removeEventListener("click", close)
  }, [])

  /* ================= ACTIONS ================= */

  const deleteCampaign = async (id) => {
    if (!confirm("Delete campaign?")) return
    await api(`/campaigns/${id}`, { method: "DELETE" })
    setOpenMenu(null)
    load()
  }

  const sendCampaign = async (campaign) => {
    setOpenMenu(null)

    const total =
      campaign.totalRecipients || campaign.queueCount || 0

    if (total > 0) {
      await api(`/campaigns/${campaign._id}/send-now`, {
        method: "POST",
      })
      load()
      return
    }

    // manual draft only
    setSelectedCampaign(campaign._id)
    setShowContacts(true)
  }

  const attachAndSend = async ({ contactIds, groupIds }) => {
    await api(`/campaigns/${selectedCampaign}/recipients/save`, {
      method: "POST",
      body: JSON.stringify({
        contactIds,
        groupIds,
        excludeContactIds: [],
      }),
    })

    await api(`/campaigns/${selectedCampaign}/send-now`, {
      method: "POST",
    })

    setShowContacts(false)
    setSelectedCampaign(null)
    load()
  }

 const saveSchedule = async ({ time }) => {
  await api(`/campaigns/${scheduleCampaign._id}/reschedule`, {
    method: "PATCH", // ✅ MUST BE PATCH
    body: {
      scheduledAt: new Date(time).toISOString(), // ✅ OBJECT
    },
  })

  setScheduleCampaign(null)
  load()
}


  /* ================= FILTER ================= */
  const filtered = campaigns.filter((c) => {
    const matchText = c.subject
      ?.toLowerCase()
      .includes(search.toLowerCase())
    const matchStatus =
      statusFilter === "all" || c.status === statusFilter
    return matchText && matchStatus
  })

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-[#f7f8fa] min-h-screen space-y-6">
      {/* HEADER */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowTemplates(true)}
          className="px-4 py-2 rounded bg-indigo-600 text-white text-sm"
        >
          + New Campaign
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subject..."
          className="px-4 py-2 border rounded w-64"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-y-auto max-h-[70vh]">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((c) => (
              <CampaignRow
                key={c._id}
                campaign={c}
                open={openMenu === c._id}
                onToggle={() =>
                  setOpenMenu(openMenu === c._id ? null : c._id)
                }
                onSend={() => sendCampaign(c)}
                onDelete={() => deleteCampaign(c._id)}
                onPreview={() => setPreviewCampaign(c)}
                onAnalytics={() => setAnalyticsCampaign(c)}
                onSchedule={
                  c.status === "draft"
                    ? () => setScheduleCampaign(c)
                    : undefined
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {scheduleCampaign && (
        <CampaignScheduleModal
          campaign={scheduleCampaign}
          onClose={() => setScheduleCampaign(null)}
          onSave={saveSchedule}
        />
      )}

      {showContacts && (
        <ContactSelector
          onSelect={attachAndSend}
          onClose={() => setShowContacts(false)}
        />
      )}

      {previewCampaign && (
        <CampaignPreviewModal
          campaign={previewCampaign}
          onClose={() => setPreviewCampaign(null)}
        />
      )}

      {analyticsCampaign && (
        <CampaignAnalytics
          campaign={analyticsCampaign}
          onClose={() => setAnalyticsCampaign(null)}
        />
      )}

      {showTemplates && (
        <TemplatePicker onClose={() => setShowTemplates(false)} />
      )}
    </div>
  )
}

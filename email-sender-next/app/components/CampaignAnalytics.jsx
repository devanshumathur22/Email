import { useEffect } from "react"

export default function CampaignAnalytics({
  campaign,
  onClose,
  onRetry,
}) {
  if (!campaign) return null

  const sent = campaign.successCount || 0
  const failed = campaign.failureCount || 0

  const total =
    campaign.totalRecipients && campaign.totalRecipients > 0
      ? campaign.totalRecipients
      : campaign.queueCount || 0

  const pending = Math.max(total - (sent + failed), 0)

  /* ===== ESC CLOSE (ONLY WHEN OPEN) ===== */
  useEffect(() => {
    if (!campaign) return

    const esc = (e) => {
      if (e.key === "Escape") onClose()
    }

    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [campaign, onClose])

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[520px] rounded-xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <h2 className="text-lg font-semibold">
          Campaign Summary
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {campaign.subject || "—"}
        </p>

        {/* META */}
        <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
          <Info
            label="Source"
            value={
              campaign.source === "queue"
                ? "Queue"
                : "Manual"
            }
          />
          <Info label="Total Emails" value={total} />
        </div>

        {/* STATS */}
        <div className="mt-6 border rounded-lg divide-y text-sm">
          <Row label="Sent" value={sent} />
          <Row label="Failed" value={failed} danger />
          <Row label="Pending" value={pending} />

          {campaign.source === "queue" && (
            <Row
              label="From Queue"
              value={campaign.queueCount || 0}
            />
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center mt-6">
          {failed > 0 && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            >
              Retry Failed Emails
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ===== SMALL COMPONENTS ===== */

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">
        {label}
      </div>
      <div className="font-medium">
        {value}
      </div>
    </div>
  )
}

function Row({ label, value, danger }) {
  return (
    <div className="flex justify-between px-4 py-3">
      <span>{label}</span>
      <span
        className={`font-medium ${
          danger ? "text-red-600" : ""
        }`}
      >
        {value}
      </span>
    </div>
  )
}

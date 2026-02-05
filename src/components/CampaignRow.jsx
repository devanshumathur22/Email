import { useRef, useEffect } from "react"

export default function CampaignRow({
  campaign,
  open,
  onToggle,
  onSend,
  onDelete,
  onPreview,
  onAnalytics,
  onSchedule,
  onPause,
  onResume,
  onRetry,
}) {
  const ref = useRef(null)

  /* ===== OUTSIDE CLICK CLOSE ===== */
  useEffect(() => {
    const close = (e) => {
      if (open && ref.current && !ref.current.contains(e.target)) {
        onToggle()
      }
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open, onToggle])

  const isDraft = campaign.status === "draft"
  const isSending = campaign.status === "sending"
  const isPaused = campaign.paused
  const hasFailed = (campaign.failureCount || 0) > 0

  const total =
    campaign.totalRecipients ||
    campaign.queueCount ||
    0

  const done =
    (campaign.successCount || 0) +
    (campaign.failureCount || 0)

  // 🔒 SAFE POSITION
  const rect = ref.current?.getBoundingClientRect()

  return (
    <tr className="border-b hover:bg-gray-50">
      {/* SUBJECT */}
      <td className="px-4 py-3 font-medium">
        {campaign.subject || "—"}
      </td>

      {/* STATUS */}
      <td className="px-4 py-3 text-sm capitalize">
        {isPaused ? "paused" : campaign.status}
      </td>

      {/* SOURCE */}
      <td className="px-4 py-3 text-sm capitalize">
        {campaign.source}
        {campaign.source === "queue" && (
          <span className="ml-2 text-xs text-blue-600">
            ({campaign.queueCount} queued)
          </span>
        )}
      </td>

      {/* PROGRESS */}
      <td className="px-4 py-3 text-sm text-center font-mono">
        {done}/{total}
      </td>

      {/* ACTIONS */}
      <td className="px-4 py-3 text-right relative" ref={ref}>
        <button
          onClick={onPreview}
          className="px-3 py-1 text-xs bg-gray-100 rounded"
        >
          Preview
        </button>

        <button
          onClick={onAnalytics}
          className="ml-2 px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded"
        >
          Stats
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="ml-2 px-2 text-lg"
        >
          ⋮
        </button>

        {open && rect && (
          <div
            className="fixed z-[9999] w-44 bg-white border rounded shadow-lg"
            style={{
              top: rect.bottom + 6,
              left: rect.right - 176,
            }}
          >
            {isDraft && <Item label="Send" onClick={onSend} />}
            {isDraft && (
              <Item label="Schedule" onClick={onSchedule} />
            )}
            {isSending && !isPaused && (
              <Item label="Pause" onClick={onPause} />
            )}
            {isPaused && (
              <Item label="Resume" onClick={onResume} />
            )}
            {hasFailed && (
              <Item
                label="Retry Failed"
                onClick={onRetry}
                danger
              />
            )}
            <hr />
            <Item label="Delete" onClick={onDelete} danger />
          </div>
        )}
      </td>
    </tr>
  )
}

function Item({ label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${
        danger ? "text-red-600" : ""
      }`}
    >
      {label}
    </button>
  )
}

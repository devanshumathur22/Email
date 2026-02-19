import { useEffect } from "react"

export default function CampaignPreviewModal({ campaign, onClose }) {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [onClose])

  if (!campaign) return null

  const html =
    campaign.body ||
    campaign.body_html ||
    campaign.html ||
    ""

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-[780px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-lg font-semibold">
              Campaign Preview
            </h2>
            <p className="text-xs text-gray-500">
              Read-only email preview
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded bg-gray-200 hover:bg-gray-300"
          >
            ✕ Close
          </button>
        </div>

        {/* META */}
        <div className="px-6 py-4 text-sm text-gray-700 space-y-1 border-b">
          <div>
            <b>Subject:</b>{" "}
            {campaign.subject || "—"}
          </div>
          <div>
            <b>Source:</b>{" "}
            {campaign.source === "queue" ? "Queue" : "Manual"}
          </div>
          {campaign.status && (
            <div>
              <b>Status:</b> {campaign.status}
            </div>
          )}
        </div>

        {/* EMAIL BODY */}
        {html ? (
          <div className="px-6 py-6 bg-white">
            <div className="border rounded-lg p-6 prose max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-400">
            ⚠️ No email content available for preview
          </div>
        )}

        {/* FOOTER */}
        {campaign.footer && (
          <div className="px-6 py-4 border-t bg-gray-50 text-sm text-gray-600">
            <div
              dangerouslySetInnerHTML={{
                __html: campaign.footer,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

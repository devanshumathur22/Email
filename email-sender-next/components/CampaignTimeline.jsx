import { motion } from "framer-motion"

export default function CampaignTimeline({ campaign }) {
  const steps = [
    {
      key: "draft",
      label: "Draft Created",
      time: campaign.createdAt,
      active: true,
    },
    {
      key: "scheduled",
      label: "Scheduled",
      time: campaign.scheduledAt,
      active: !!campaign.scheduledAt,
    },
    {
      key: "sent",
      label: "Sent",
      time: campaign.sentAt,
      active: campaign.status === "sent",
    },
    {
      key: "failed",
      label: "Failed",
      time: campaign.failedAt,
      active: campaign.status === "failed",
    },
  ]

  return (
    <div className="space-y-5">
      {steps.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-start gap-4"
        >
          {/* DOT */}
          <div
            className={`w-3 h-3 rounded-full mt-1 ${
              s.active ? "bg-indigo-600" : "bg-gray-300"
            }`}
          />

          {/* CONTENT */}
          <div>
            <p
              className={`font-medium ${
                s.active ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {s.label}
            </p>

            <p className="text-xs text-gray-500">
              {s.time
                ? new Date(s.time).toLocaleString()
                : "—"}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

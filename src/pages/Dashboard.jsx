import { useEffect, useState } from "react"
import { api } from "../api"
import { motion } from "framer-motion"

/* 🔢 COUNT UP */
function CountUp({ value, duration = 800 }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Number(value) || 0
    if (end === 0) {
      setCount(0)
      return
    }

    const step = Math.max(1, Math.floor(end / (duration / 16)))

    const timer = setInterval(() => {
      start += step
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, duration])

  return <>{count}</>
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  const loadStats = async () => {
    const data = await api("/campaigns/stats/dashboard")
    setStats(data)
  }

  useEffect(() => {
    loadStats()
    const i = setInterval(loadStats, 10000)
    return () => clearInterval(i)
  }, [])

  if (!stats) return <p className="p-6">Loading...</p>

  const sent = stats.emails?.success || 0
  const failed = stats.emails?.failure || 0

  const cards = [
    {
      title: "Total Campaigns",
      value: stats.totalCampaigns || 0,
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      title: "Emails Sent",
      value: sent,
      gradient: "from-emerald-500 to-green-500",
    },
    {
      title: "Failed Emails",
      value: failed,
      gradient: "from-rose-500 to-red-500",
    },
  ]

  return (
    <div className="p-8 space-y-10 bg-[#f7f8fa] min-h-screen">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Live email system overview (auto refresh)
        </p>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.04 }}
            className="relative overflow-hidden rounded-2xl bg-white border shadow-sm"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.gradient}`}
            />
            <div className="p-5">
              <p className="text-sm text-gray-500">{c.title}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                <CountUp value={c.value} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DELIVERY SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Delivery Summary
          </h3>

          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Success</p>
              <p className="text-2xl font-semibold text-emerald-600">
                <CountUp value={sent} />
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Failure</p>
              <p className="text-2xl font-semibold text-rose-600">
                <CountUp value={failed} />
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            System Status
          </h3>
          <p className="text-gray-500 text-sm mt-4">
            Auto refresh enabled
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700 text-sm font-medium">
            ● Refresh every 10 seconds
          </div>
        </div>
      </div>
    </div>
  )
}

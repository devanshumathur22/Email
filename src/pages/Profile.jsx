import { motion } from "framer-motion"

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
    email: "user@email.com",
  }

  return (
    <div className="p-8 bg-[#f7f8fa] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-semibold text-gray-900">
          Profile
        </h1>
        <p className="text-gray-500 mt-1">
          Manage your account information
        </p>
      </motion.div>

      <div className="mt-8 max-w-xl rounded-2xl bg-white border p-6 shadow-sm">
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

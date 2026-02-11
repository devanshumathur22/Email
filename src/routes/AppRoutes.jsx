import { Routes, Route } from "react-router-dom"

import Dashboard from "../pages/Dashboard"
import Compose from "../pages/Compose"
import Campaigns from "../pages/Campaigns"
import Templates from "../pages/Templates"
import Contacts from "../pages/Contacts"
import Settings from "../pages/Settings"
import Queue from "../pages/Queue"
import Groups from "../pages/Groups"
import Profile from "../pages/Profile"
import Register from "../pages/Register"
import ForgotPassword from "../pages/ForgotPassword"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/compose" element={<Compose />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/templates" element={<Templates />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/queue" element={<Queue />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  )
}

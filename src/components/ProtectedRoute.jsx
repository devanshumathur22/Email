import { Routes, Route } from "react-router-dom"
import ProtectedRoute from "../components/ProtectedRoute"

import Dashboard from "../pages/Dashboard"
import Compose from "../pages/Compose"
import Campaigns from "../pages/Campaigns"
import Templates from "../pages/Templates"
import Contacts from "../pages/Contacts"
import Settings from "../pages/Settings"
import TemplateBuilder from "../pages/TemplateBuilder"
import CampaignCreate from "../pages/CampaignCreate"
import Queue from "../pages/Queue"
import Groups from "../pages/Groups"
import Register from "../pages/Register"
import Profile from "../pages/Profile"
import ForgotPassword from "../pages/ForgotPassword"
import Login from "../pages/Login"   // 👈 ADD THIS

export default function AppRoutes() {
  return (
    <Routes>

      {/* 🔓 PUBLIC ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 🔐 PROTECTED ROUTES */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/compose" element={<ProtectedRoute><Compose /></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
      <Route path="/campaigns/new" element={<ProtectedRoute><CampaignCreate /></ProtectedRoute>} />
      <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
      <Route path="/templates/new" element={<ProtectedRoute><TemplateBuilder /></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
      <Route path="/queue" element={<ProtectedRoute><Queue /></ProtectedRoute>} />
      <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

    </Routes>
  )
}

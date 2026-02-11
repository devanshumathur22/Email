import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"

export default function App() {
  const token = localStorage.getItem("token")

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/" /> : <Register />}
        />
        <Route
          path="/forgot-password"
          element={token ? <Navigate to="/" /> : <ForgotPassword />}
        />

        {/* Protected */}
        <Route
          path="/*"
          element={token ? <MainLayout /> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

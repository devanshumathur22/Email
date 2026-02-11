import { BrowserRouter, Routes, Route } from "react-router-dom"
import MainLayout from "./layouts/MainLayout"
import AppRoutes from "./routes/AppRoutes"
import Login from "./pages/Login"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected with layout */}
        <Route
          path="/*"
          element={<MainLayout />}
        />
      </Routes>
    </BrowserRouter>
  )
}

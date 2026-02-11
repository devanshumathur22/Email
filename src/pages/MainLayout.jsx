import Sidebar from "../components/Sidebar"
import Topbar from "../components/Topbar"
import AppRoutes from "../routes/AppRoutes"

export default function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <AppRoutes />
      </div>
    </div>
  )
}

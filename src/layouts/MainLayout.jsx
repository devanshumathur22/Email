import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // ← yeh line add kar (path sahi kar le agar alag folder mein hai)

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar ko component se laao – duplicate mat likho */}
      <Sidebar />

      {/* Right side – header + content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Email Sender</h1> {/* ← yeh change kar diya, Campaign Manager hata diya */}
          
          <div className="flex items-center gap-4">
            {/* Agar lucide-react install hai to */}
            {/* <Bell size={20} /> */}
            {/* Warna simple text ya emoji */}
            <span>🔔</span>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                D
              </div>
              <span>Devanshu</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
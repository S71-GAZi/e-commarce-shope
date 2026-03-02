// import type React from "react"
// import { ProtectedRoute } from "@/components/auth/protected-route"
// import { AdminSidebar } from "@/components/admin/admin-sidebar"
// import { AdminHeader } from "@/components/admin/admin-header"

// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <ProtectedRoute requireAdmin>
//       <div className="flex h-screen overflow-hidden">
//         <AdminSidebar />
//         <div className="flex flex-1 flex-col overflow-hidden">
//           <AdminHeader />
//           <main className="flex-1 overflow-y-auto bg-muted/10 p-6">{children}</main>
//         </div>
//       </div>
//     </ProtectedRoute>
//   )
// }


"use client"

import type React from "react"
import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-muted/10">

        {/* Sidebar */}
        <div
          className={`
            fixed inset-y-0 left-0 z-50 w-64 transform bg-background shadow-lg transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:relative md:translate-x-0 md:shadow-none
          `}
        >
          <AdminSidebar closeSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>

      </div>
    </ProtectedRoute>
  )
}
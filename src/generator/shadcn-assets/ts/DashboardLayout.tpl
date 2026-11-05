import { Outlet } from 'react-router-dom'
import { AppSidebar } from "./slices/Sidebar"
import { SiteHeader } from "./slices/Header"
import {
  SidebarInset,
  SidebarProvider,
} from "../components/ui/sidebar"


export function DashboardLayout({ user, onLogout }: { user: { name: string; email: string; role: string }; onLogout: () => void }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} onLogout={onLogout} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet context={{ user }} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
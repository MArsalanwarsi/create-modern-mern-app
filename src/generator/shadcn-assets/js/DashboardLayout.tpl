import { Outlet } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'
import { Sidebar } from './slices/Sidebar'
import { Header } from './slices/Header'
export function DashboardLayout({ user, onLogout }) {
  return (
    <SidebarProvider>
      <Sidebar user={user} />
      <SidebarInset>
        <Header onLogout={onLogout} />
        <div className="mx-auto w-full max-w-6xl space-y-6 px-5 py-8 lg:px-10">
          <Outlet context={{ user }} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

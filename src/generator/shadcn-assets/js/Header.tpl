import { Button } from '../../components/ui/button'
import { Separator } from '../../components/ui/separator'
import { SidebarTrigger } from '../../components/ui/sidebar'
export function Header({ onLogout }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4 lg:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
      <span className="text-sm font-medium">Dashboard</span>
      <Button variant="outline" size="sm" className="ml-auto" onClick={onLogout}>
        Sign out
      </Button>
    </header>
  )
}

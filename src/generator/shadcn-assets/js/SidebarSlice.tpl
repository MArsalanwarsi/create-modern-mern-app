import { Link, useLocation } from 'react-router-dom'
import { Home, LayoutDashboard, PanelsTopLeft, Settings } from 'lucide-react'
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '../../components/ui/sidebar'
const links = [
  { path: '/dashboard', title: 'Overview', Icon: LayoutDashboard },
  { path: '/dashboard/settings', title: 'Settings', Icon: Settings },
  { path: '/', title: 'Landing page', Icon: Home },
]
export function Sidebar({ user }) {
  const { pathname } = useLocation()
  const { setOpenMobile } = useSidebar()
  return (
    <SidebarRoot variant="inset">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <PanelsTopLeft
            aria-hidden="true"
            className="size-6 rounded bg-primary p-1 text-primary-foreground"
          />{' '}
          Workspace
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {links.map(({ path, title, Icon }) => (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton asChild isActive={pathname === path}>
                  <Link
                    to={path}
                    aria-current={pathname === path ? 'page' : undefined}
                    onClick={() => setOpenMobile(false)}
                  >
                    <Icon aria-hidden="true" />
                    {title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <span className="truncate text-sm font-medium">{user?.name || 'Workspace Member'}</span>
        <span className="truncate text-xs text-muted-foreground">{user?.email || 'member@example.com'}</span>
      </SidebarFooter>
    </SidebarRoot>
  )
}

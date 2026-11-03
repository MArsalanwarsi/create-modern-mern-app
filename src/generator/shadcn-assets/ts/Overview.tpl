import { useOutletContext } from 'react-router-dom'
import { Activity, CreditCard, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { Badge } from '../../components/ui/badge'
import { Avatar, AvatarFallback } from '../../components/ui/avatar'
import type { DashboardContext } from '../../layout/DashboardLayout'

type Transaction = {
  name: string
  email: string
  type: string
  status: string
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline'
  date: string
  amount: string
  initials: string
}

const transactions: Transaction[] = [
  {
    name: 'Liam Johnson',
    email: 'liam@example.com',
    type: 'Sale',
    status: 'Approved',
    badgeVariant: 'default',
    date: '2026-06-23',
    amount: '$250.00',
    initials: 'LJ',
  },
  {
    name: 'Olivia Smith',
    email: 'olivia@example.com',
    type: 'Refund',
    status: 'Declined',
    badgeVariant: 'destructive',
    date: '2026-06-24',
    amount: '$150.00',
    initials: 'OS',
  },
  {
    name: 'Noah Williams',
    email: 'noah@example.com',
    type: 'Subscription',
    status: 'Approved',
    badgeVariant: 'default',
    date: '2026-06-25',
    amount: '$350.00',
    initials: 'NW',
  },
  {
    name: 'Emma Brown',
    email: 'emma@example.com',
    type: 'Sale',
    status: 'Pending',
    badgeVariant: 'secondary',
    date: '2026-06-26',
    amount: '$450.00',
    initials: 'EB',
  },
  {
    name: 'Sofia Davis',
    email: 'sofia@example.com',
    type: 'Subscription',
    status: 'Approved',
    badgeVariant: 'default',
    date: '2026-06-27',
    amount: '$550.00',
    initials: 'SD',
  },
]

export function Overview() {
  const context = useOutletContext<DashboardContext | undefined>()
  const user = context?.user
  const userInitials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <section aria-labelledby="overview-heading" className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold tracking-widest text-primary uppercase">
          Dashboard Overview
        </p>
        <h1 id="overview-heading" className="text-3xl font-semibold tracking-tight">
          Welcome back, {user?.name || 'Member'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance metrics and recent transaction activity across your workspace.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Account Section */}
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Transactions</CardTitle>
            <CardDescription>Recent transaction activity across your platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="text-xs font-semibold">
                            {tx.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{tx.name}</div>
                          <div className="hidden text-xs text-muted-foreground md:inline">
                            {tx.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {tx.type}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={tx.badgeVariant}>{tx.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {tx.date}
                    </TableCell>
                    <TableCell className="text-right font-medium">{tx.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Current Session / User Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Account Profile</CardTitle>
            <CardDescription>Authenticated user session details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 border">
                <AvatarFallback className="bg-primary text-base font-bold text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="font-semibold leading-none">{user?.name || 'Workspace Member'}</p>
                <p className="text-sm text-muted-foreground break-all">{user?.email || 'member@example.com'}</p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="outline" className="capitalize">
                  {user?.role || 'member'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Session</span>
                <Badge variant="secondary">Active (HTTP-Only)</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">CSRF Header</span>
                <span className="font-mono text-xs text-muted-foreground">mern-client</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export { Overview as Dashboard }
export default Overview

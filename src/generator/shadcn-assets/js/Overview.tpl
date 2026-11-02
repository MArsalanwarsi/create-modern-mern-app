import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
export function Overview() {
  const { user } = useOutletContext()
  return (
    <section aria-labelledby="overview-heading" className="space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
          Workspace overview
        </p>
        <h1 id="overview-heading" className="text-3xl font-semibold tracking-tight">
          Welcome, {user.name}
        </h1>
        <p className="mt-2 text-muted-foreground">Account details from your authenticated session.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription>Account</CardDescription>
            <CardTitle className="break-all text-xl">{user.email}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Your sign-in email address.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Access level</CardDescription>
            <CardTitle className="text-xl capitalize">{user.role}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            The role assigned to this account.
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

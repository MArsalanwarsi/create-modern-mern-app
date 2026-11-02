import { Link } from 'react-router-dom'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Field, FieldGroup, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'
export function AuthForm({ mode, onSubmit, pending, error }) {
  const signup = mode === 'signup'
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-md items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">
            {signup ? 'Create an account' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {signup
              ? 'Create your workspace account to open the dashboard.'
              : 'Enter your email and password to open your dashboard.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            aria-busy={pending}
            onSubmit={(event) => {
              event.preventDefault()
              if (pending) return
              const fields = new FormData(event.currentTarget)
              onSubmit({
                name: String(fields.get('name') ?? '').trim(),
                email: String(fields.get('email') ?? '').trim(),
                password: String(fields.get('password') ?? ''),
              })
            }}
          >
            <FieldGroup>
              {signup && (
                <Field>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input id="name" name="name" autoComplete="name" maxLength={100} required />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={signup ? 12 : undefined}
                  aria-describedby={signup ? 'password-help' : undefined}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                  required
                />
                {signup && <p id="password-help" className="text-sm text-muted-foreground">Use at least 12 characters and at most 72 UTF-8 bytes.</p>}
              </Field>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button disabled={pending} type="submit">
                {pending ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {signup ? 'Already have an account? ' : 'New here? '}
                <Link
                  className="text-primary underline underline-offset-4"
                  to={signup ? '/login' : '/signup'}
                >
                  {signup ? 'Sign in' : 'Create an account'}
                </Link>
              </p>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

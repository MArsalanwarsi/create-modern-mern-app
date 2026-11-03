import { LoginForm } from '../login-form'
import { SignupForm } from '../signup-form'

export type AuthFormProps = {
  mode: 'login' | 'signup'
  onSubmit: (credentials: { name?: string; email: string; password: string }) => void
  pending: boolean
  error?: string | null
}

export function AuthForm({ mode, onSubmit, pending, error }: AuthFormProps) {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-md items-center px-4 py-10">
      <div className="w-full">
        {mode === 'signup' ? (
          <SignupForm
            onSubmit={(fields) => onSubmit(fields)}
            pending={pending}
            error={error}
          />
        ) : (
          <LoginForm
            onSubmit={(fields) => onSubmit(fields)}
            pending={pending}
            error={error}
          />
        )}
      </div>
    </div>
  )
}

export { LoginForm, SignupForm }
export default AuthForm

import { LoginForm } from '../login-form'
import { SignupForm } from '../signup-form'

export function AuthForm({ mode, onSubmit, pending, error }) {
  return (
    <div className="mx-auto flex min-h-[70svh] max-w-md items-center px-4 py-10">
      <div className="w-full">
        {mode === 'signup' ? (
          <SignupForm onSubmit={onSubmit} pending={pending} error={error} />
        ) : (
          <LoginForm onSubmit={onSubmit} pending={pending} error={error} />
        )}
      </div>
    </div>
  )
}

export { LoginForm, SignupForm }
export default AuthForm

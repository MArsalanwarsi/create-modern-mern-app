import type { FormEvent } from 'react';
import { LoginForm } from '../login-form';
import { SignupForm } from '../signup-form';

type Fields = { name?: string; email: string; password: string };
export function AuthForm({ mode, pending, error, onSubmit }: {
  mode: 'login' | 'signup'; pending: boolean; error?: string; onSubmit: (fields: Fields) => void;
}) {
  function submit(event: FormEvent<HTMLDivElement>) {
    event.preventDefault();
    if (pending || !(event.target instanceof HTMLFormElement)) return;
    const form = event.target;
    const data = new FormData(form);
    const password = String(data.get('password'));
    if (mode === 'signup' && password !== data.get('confirm-password')) {
      const confirmation = form.elements.namedItem('confirm-password') as HTMLInputElement;
      confirmation.setCustomValidity('Passwords do not match.');
      confirmation.reportValidity();
      confirmation.setCustomValidity('');
      return;
    }
    onSubmit({ name: String(data.get('name') || ''), email: String(data.get('email')), password });
  }
  return <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10" onSubmit={submit} aria-busy={pending}>
    <div className="w-full max-w-sm">
      {mode === 'login' ? <LoginForm /> : <SignupForm />}
      {error && <p role="alert">{error}</p>}
    </div>
  </div>;
}

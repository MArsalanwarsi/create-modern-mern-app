export function addAuthClient(files, isTsOrOptions, maybeOptions = {}) {
  const isTs = typeof isTsOrOptions === 'boolean' ? isTsOrOptions : Boolean(isTsOrOptions?.isTs);
  const options = typeof isTsOrOptions === 'object' && isTsOrOptions !== null ? isTsOrOptions : maybeOptions;
  const styling = options.styling || 'shadcn';
  const ext = isTs ? 'tsx' : 'jsx';
  const script = isTs ? 'ts' : 'js';

  // 1. Core Axios client
  files[`src/api/client.${script}`] = `import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  withCredentials: true,
  headers: { 'X-Requested-With': 'mern-client' }
});

export function errorMessage(error${isTs ? ': unknown' : ''}) {
  return axios.isAxiosError(error) && typeof error.response?.data?.message === 'string'
    ? error.response.data.message : 'Could not reach the API. Check your connection and retry.';
}
`;

  // 2. Account component
  if (styling === 'shadcn') {
    files[`src/pages/auth/Account.${ext}`] = `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../../components/auth/AuthForm';
import { api, errorMessage } from '../../api/client';

export function Account({ mode }${isTs ? ": { mode: 'login' | 'signup' }" : ''}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  async function submit(fields${isTs ? ': { name?: string; email: string; password: string }' : ''}) {
    setError(''); setPending(true);
    try { await api.post('/auth/' + mode, fields); navigate('/dashboard', { replace: true }); }
    catch (err) { setError(errorMessage(err)); }
    finally { setPending(false); }
  }
  return <AuthForm mode={mode} pending={pending} error={error} onSubmit={submit} />;
}
`;
  } else {
    // Tailwind or CSS fallback form
    files[`src/pages/auth/Account.${ext}`] = `import { useState${isTs ? ', type FormEvent' : ''} } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';

export function Account({ mode }${isTs ? ": { mode: 'login' | 'signup' }" : ''}) {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const isSignup = mode === 'signup';

  async function handleSubmit(e${isTs ? ': FormEvent<HTMLFormElement>' : ''}) {
    e.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);
    const form = new FormData(e.currentTarget);
    const fields = {
      name: String(form.get('name') || '').trim(),
      email: String(form.get('email') || '').trim(),
      password: String(form.get('password') || '')
    };
    try {
      await api.post('/auth/' + mode, fields);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-[80svh] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{isSignup ? 'Sign Up' : 'Login'}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignup ? 'Enter your information below to create your account' : 'Enter your email below to login to your account'}
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {isSignup && (
            <div className="grid gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</label>
              <input id="name" name="name" required autoComplete="name" className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-ring" placeholder="John Doe" />
            </div>
          )}
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-ring" placeholder="m@example.com" />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <input id="password" name="password" type="password" required minLength={12} autoComplete={isSignup ? 'new-password' : 'current-password'} className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-ring" />
          </div>
          {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
          <button type="submit" disabled={pending} className="mt-2 w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {pending ? (isSignup ? 'Creating account…' : 'Logging in…') : (isSignup ? 'Sign Up' : 'Login')}
          </button>
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {isSignup ? (
              <>Already have an account? <Link to="/login" className="text-primary underline">Login</Link></>
            ) : (
              <>Don&apos;t have an account? <Link to="/signup" className="text-primary underline">Sign up</Link></>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
`;
  }

  // 3. AuthenticatedDashboard component
  files[`src/layout/AuthenticatedDashboard.${ext}`] = `import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { api, errorMessage } from '../api/client';

export function AuthenticatedDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState${isTs ? '<{ name: string; email: string; role: string } | null>' : ''}(null);
  const [error, setError] = useState('');
  const [attempt, retry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api.get('/auth/me', { signal: controller.signal })
      .then(({ data }) => setUser(data.user))
      .catch(err => {
        if (controller.signal.aborted) return;
        if (axios.isAxiosError(err) && err.response?.status === 401) navigate('/login', { replace: true });
        else setError(errorMessage(err));
      });
    return () => controller.abort();
  }, [navigate, attempt]);
  async function logout() {
    try { await api.post('/auth/logout'); navigate('/login', { replace: true }); }
    catch (err) { setError(errorMessage(err)); }
  }
  if (error) return <main className="p-8"><p role="alert">{error}</p><button onClick={() => { setError(''); retry(attempt + 1); }}>Try again</button></main>;
  if (!user) return <main className="p-8" role="status">Checking your session…</main>;
  return <DashboardLayout user={user} onLogout={logout} />;
}
`;

  // 4. Fallback DashboardLayout for non-shadcn
  if (styling !== 'shadcn') {
    files[`src/layout/DashboardLayout.${ext}`] = `import { Outlet } from 'react-router-dom';

export function DashboardLayout({ user, onLogout }${isTs ? ': { user: { name: string; email: string; role: string }; onLogout: () => void }' : ''}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="flex justify-between items-center px-6 py-4 border-b border-border bg-background">
        <span className="font-bold text-lg">Dashboard</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <button onClick={onLogout} className="text-sm font-medium text-destructive hover:underline">
            Logout
          </button>
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
}
`;

  }

  if (styling !== 'shadcn') files[`src/pages/dashboard/Overview.${ext}`] = `import { Link, useOutletContext } from 'react-router-dom';

export function Overview() {
  const { user } = useOutletContext${isTs ? '<{ user: { name: string; email: string; role: string } }>' : ''}();
  return (
    <section className="mx-auto max-w-3xl space-y-5 p-4">
      <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
      <p>Signed in as {user.email}</p>
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Workspace access</h2>
        <p className="my-3">Your role: <strong>{user.role}</strong></p>
        {user.role === 'admin'
          ? <Link className="underline" to="/dashboard/members">View members</Link>
          : <p>Only administrators can view the member directory.</p>}
      </div>
    </section>
  );
}
`;

  files[`src/pages/dashboard/Members.${ext}`] = `import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { api, errorMessage } from '../../api/client';
${isTs ? 'type Member = { _id: string; name: string; email: string; role: string };' : ''}

export function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState${isTs ? '<Member[] | null>' : ''}(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    api.get('/users', { signal: controller.signal })
      .then(({ data }) => setMembers(data.data))
      .catch(err => {
        if (controller.signal.aborted) return;
        if (axios.isAxiosError(err) && err.response?.status === 401) navigate('/login', { replace: true });
        else setError(errorMessage(err));
      });
    return () => controller.abort();
  }, [navigate, attempt]);
  return <section className="space-y-4 p-4">
    <h1 className="text-2xl font-bold">Members</h1>
    {error ? <div><p role="alert">{error}</p><button onClick={() => { setError(''); setAttempt(attempt + 1); }}>Retry</button></div>
      : members === null ? <p role="status">Loading members…</p>
      : members.length === 0 ? <p>No members found.</p>
      : <div className="overflow-x-auto"><table className="w-full text-left"><caption>Up to 50 most recent members</caption>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
        <tbody>{members.map(member => <tr key={member._id}>
          <td>{member.name}</td><td>{member.email}</td><td>{member.role}</td>
        </tr>)}</tbody>
      </table></div>}
  </section>;
}
`;
}

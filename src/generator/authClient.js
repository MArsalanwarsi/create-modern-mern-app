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
import { LoginForm } from '../../components/login-form';
import { SignupForm } from '../../components/signup-form';
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
  return (
    <div className="flex min-h-[80svh] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {mode === 'signup' ? (
          <SignupForm pending={pending} error={error} onSubmit={submit} />
        ) : (
          <LoginForm pending={pending} error={error} onSubmit={submit} />
        )}
      </div>
    </div>
  );
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

    // 5. Fallback Overview for non-shadcn (Tailwind or CSS)
    files[`src/pages/dashboard/Overview.${ext}`] = `import { useOutletContext } from 'react-router-dom';
${isTs ? `
type Transaction = {
  name: string;
  email: string;
  type: string;
  status: string;
  date: string;
  amount: string;
};

type DashboardContext = {
  user?: {
    name: string;
    email: string;
    role: string;
  };
};
` : ''}
const transactions${isTs ? ': Transaction[]' : ''} = [
  {
    name: 'Liam Johnson',
    email: 'liam@example.com',
    type: 'Sale',
    status: 'Approved',
    date: '2026-06-23',
    amount: '$250.00'
  },
  {
    name: 'Olivia Smith',
    email: 'olivia@example.com',
    type: 'Refund',
    status: 'Declined',
    date: '2026-06-24',
    amount: '$150.00'
  },
  {
    name: 'Noah Williams',
    email: 'noah@example.com',
    type: 'Subscription',
    status: 'Approved',
    date: '2026-06-25',
    amount: '$350.00'
  },
  {
    name: 'Emma Brown',
    email: 'emma@example.com',
    type: 'Sale',
    status: 'Pending',
    date: '2026-06-26',
    amount: '$450.00'
  },
  {
    name: 'Sofia Davis',
    email: 'sofia@example.com',
    type: 'Subscription',
    status: 'Approved',
    date: '2026-06-27',
    amount: '$550.00'
  }
];

export function Overview() {
  const { user } = (useOutletContext${isTs ? '<DashboardContext>' : ''}() || {})${isTs ? ' as DashboardContext' : ''};

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-xs font-semibold tracking-widest text-primary uppercase">
          Dashboard Overview
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Welcome back, {user?.name || 'Member'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Performance metrics and recent transaction activity across your workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-foreground">Total Revenue</h3>
            <svg className="size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-foreground">Subscriptions</h3>
            <svg className="size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">+2,350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-foreground">Sales</h3>
            <svg className="size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-foreground">Active Now</h3>
            <svg className="size-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-xs">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground">Recent transactions across your store.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-t border-b border-border bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr key={tx.email}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{tx.name}</div>
                    <div className="text-xs text-muted-foreground">{tx.email}</div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{tx.type}</td>
                  <td className="px-6 py-4">
                    <span className={\`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold \${
                      tx.status === 'Approved'
                        ? 'bg-primary/10 text-primary'
                        : tx.status === 'Pending'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-destructive/10 text-destructive'
                    }\`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{tx.date}</td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">{tx.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`;
  }
}

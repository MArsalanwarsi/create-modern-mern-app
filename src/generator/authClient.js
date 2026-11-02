export function addAuthClient(files, isTs) {
  const ext = isTs ? 'tsx' : 'jsx';
  const script = isTs ? 'ts' : 'js';
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
}

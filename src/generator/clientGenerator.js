import { addShadcn } from './shadcn.js';
import { addAuthClient } from './authClient.js';
import { writeFileTree } from '../utils/fs-helpers.js';
import { sanitizePackageName } from '../utils/naming.js';

export async function generateClient(targetDir, options = {}) {
  const {
    projectName: rawName = 'client',
    variant,
    language,
    styling,
    auth,
    packages = [],
    clientPackages = []
  } = options;

  const projectName = sanitizePackageName(rawName);

  // 1. Language & Compiler normalization
  const resolvedVariant = variant || language || 'js';
  const isTs = resolvedVariant.startsWith('ts');
  const isCompiler = resolvedVariant.includes('compiler');
  const ext = isTs ? 'tsx' : 'jsx';
  const scriptExt = isTs ? 'ts' : 'js';

  // 2. Packages array normalization
  const resolvedPackages = Array.isArray(packages) && packages.length > 0
    ? packages
    : (Array.isArray(clientPackages) ? clientPackages : []);
  const hasRedux = resolvedPackages.includes('redux');
  const hasToastify = resolvedPackages.includes('toastify');

  // 3. Styling normalization (default: 'shadcn')
  let resolvedStyling = 'shadcn';
  if (styling) {
    resolvedStyling = styling;
  } else if (resolvedPackages.includes('css')) {
    resolvedStyling = 'css';
  } else if (resolvedPackages.includes('tailwind') && !resolvedPackages.includes('shadcn')) {
    resolvedStyling = 'shadcn';
  }

  // 4. Auth normalization (default: true)
  const hasAuth = auth !== false && auth !== 'false';

  const files = {};

  // 1. package.json dependencies
  const dependencies = {
    axios: '^1.21.0',
    react: '^19.3.1',
    'react-dom': '^19.3.1',
    'react-router-dom': '^7.18.5'
  };

  const devDependencies = {
    '@vitejs/plugin-react': '^6.2.1',
    oxlint: '^1.90.0',
    vite: '^8.3.5'
  };

  if (resolvedStyling !== 'css') {
    dependencies['clsx'] = '^2.1.1';
    dependencies['class-variance-authority'] = '^0.7.1';
    dependencies['tailwind-merge'] = '^3.7.0';
    dependencies['lucide-react'] = '^1.66.0';
    devDependencies['tailwindcss'] = '^4.3.3';
    devDependencies['@tailwindcss/vite'] = '^4.3.3';
  }

  if (isCompiler) {
    devDependencies['@rolldown/plugin-babel'] = '^0.3.0';
    devDependencies['@babel/core'] = '^8.1.0';
    devDependencies['babel-plugin-react-compiler'] = '^1.0.0';
  }

  if (isTs) {
    devDependencies['typescript'] = '^7.0.2';
    devDependencies['@types/react'] = '^19.3.0';
    devDependencies['@types/react-dom'] = '^19.3.0';
  }

  if (hasRedux) {
    dependencies['@reduxjs/toolkit'] = '^2.13.0';
    dependencies['react-redux'] = '^9.3.1';
  }

  if (hasToastify) {
    dependencies['react-toastify'] = '^11.2.0';
  }

  const clientPkg = {
    name: projectName + '-client',
    private: true,
    version: '0.0.0',
    type: 'module',
    engines: { node: '>=24.16.0' },
    scripts: {
      dev: 'vite',
      build: isTs ? 'tsc -b && vite build' : 'vite build',
      lint: 'oxlint src --deny-warnings',
      preview: 'vite preview'
    },
    dependencies,
    devDependencies
  };

  // 2. index.html
  files['index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} - Frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${ext}"></script>
  </body>
</html>
`;

  // 3. vite.config.js / ts
  files[`vite.config.${scriptExt}`] = `import { defineConfig } from 'vite';
import react${isCompiler ? ', { reactCompilerPreset }' : ''} from '@vitejs/plugin-react';
${isCompiler ? "import babel from '@rolldown/plugin-babel';\n" : ''}${resolvedStyling !== 'css' ? "import tailwindcss from '@tailwindcss/vite';\n" : ''}import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()${isCompiler ? ',\n    babel({ presets: [reactCompilerPreset()] })' : ''}${resolvedStyling !== 'css' ? ',\n    tailwindcss()' : ''}
  ],
  server: {
    proxy: { '/api': 'http://localhost:5000' },
    port: 3000
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  }
});
`;

  // 4. TypeScript configs if applicable
  if (isTs) {
    files['tsconfig.json'] = JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        useDefineForClassFields: true,
        types: ["vite/client"],
        lib: ["ES2023", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        isolatedModules: true,
        moduleDetection: "force",
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        paths: {
          "@/*": ["./src/*"]
        }
      },
      include: ["src"]
    }, null, 2);
  }

  if (!isTs) {
    files['jsconfig.json'] = JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } } }, null, 2);
  }

  // 5. Tailwind & Shadcn configs
  if (resolvedStyling === 'shadcn') {
    files['components.json'] = JSON.stringify({
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "new-york",
      "rsc": false,
      "tsx": isTs,
      "tailwind": {
        "config": "",
        "css": "src/index.css",
        "baseColor": "slate",
        "cssVariables": true
      },
      "aliases": {
        "components": "@/components",
        "utils": "@/lib/utils"
      }
    }, null, 2);
  }

  if (resolvedStyling !== 'css') {
    files[`src/lib/utils.${scriptExt}`] = `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs${isTs ? ': import("clsx").ClassValue[]' : ''}) {
  return twMerge(clsx(inputs));
}
`;
  }

  // 6. index.css (Standardized @layer base without hardcoded body colors)
  if (resolvedStyling === 'shadcn') {
    files['src/index.css'] = `@import "tailwindcss";
@import "./styles/shadcn.css";

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
`;
  } else if (resolvedStyling === 'tailwind') {
    files['src/index.css'] = `@import "tailwindcss";

@theme {
  --color-background: #ffffff;
  --color-foreground: #17202a;
  --color-card: #ffffff;
  --color-card-foreground: #17202a;
  --color-primary: #193d59;
  --color-primary-foreground: #ffffff;
  --color-secondary: #e2e8f0;
  --color-secondary-foreground: #1e293b;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #475569;
  --color-border: #cbd5e1;
  --color-ring: #2563eb;
  --color-destructive: #b91c1c;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
`;
  } else {
    // Plain CSS design tokens
    files['src/index.css'] = `:root {
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --brand-primary: #2563eb;
  --brand-hover: #1d4ed8;
  --brand-text: #ffffff;
  --destructive: #ef4444;
  --radius: 8px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--brand-primary);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

.container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.website-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.website-main {
  flex: 1;
  padding: 2rem 0;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}
.navbar-brand {
  font-weight: 700;
  font-size: 1.25rem;
}
.navbar-brand a {
  color: var(--text-primary);
  text-decoration: none;
}
.navbar-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}
.navbar-links a {
  color: var(--text-muted);
  font-weight: 500;
}
.navbar-links a:hover {
  color: var(--text-primary);
}

.footer {
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-weight: 500;
  border-radius: var(--radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out;
  text-decoration: none;
}
.btn-primary {
  background-color: var(--brand-primary);
  color: var(--brand-text);
}
.btn-primary:hover {
  background-color: var(--brand-hover);
  text-decoration: none;
}
.btn-outline {
  background-color: transparent;
  border-color: var(--border-color);
  color: var(--text-primary);
}
.btn-outline:hover {
  background-color: var(--bg-secondary);
}

.card {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}
.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}
`;
  }

  // 7. Redux Toolkit Store & Slice if selected
  if (hasRedux) {
    files[`src/store/slices/counterSlice.${scriptExt}`] = `import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
`;

    files[`src/store/index.${scriptExt}`] = `import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
});
${isTs ? `
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;` : ''}
`;
  }

  // 8. Slices in src/layout/slices/ (Navbar & Footer - no inline styles)
  files[`src/layout/slices/Navbar.${ext}`] = `import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
      <div className="font-bold text-xl">
        <Link to="/" className="text-foreground hover:text-primary transition-colors">
          ${projectName}
        </Link>
      </div>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Home
        </Link>
        <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
          About
        </Link>
        <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
          Contact
        </Link>${hasAuth ? `
        <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
          Login
        </Link>
        <Link to="/signup" className="text-muted-foreground hover:text-foreground transition-colors">
          Sign Up
        </Link>
        <Link to="/dashboard" className="text-primary font-semibold hover:underline">
          Dashboard →
        </Link>` : ''}
      </div>
    </nav>
  );
}
`;

  files[`src/layout/slices/Footer.${ext}`] = `
export function Footer() {
  return (
    <footer className="py-6 px-4 bg-muted/50 border-t border-border text-center text-sm text-muted-foreground">
      <p>© {new Date().getFullYear()} ${projectName}. Built with MERN Stack Generator.</p>
    </footer>
  );
}
`;

  // 9. WebsiteLayout
  files[`src/layout/WebsiteLayout.${ext}`] = `import { Outlet } from 'react-router-dom';
import { Navbar } from './slices/Navbar';
import { Footer } from './slices/Footer';

export function WebsiteLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 p-6 md:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
`;

  // 10. Website Pages in src/pages/website/ (no inline styles)
  files[`src/pages/website/Home.${ext}`] = `${hasRedux ? `import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../../store/slices/counterSlice';` : ''}
${hasToastify ? `import { toast } from 'react-toastify';` : ''}
${resolvedStyling === 'shadcn' ? "import { Button } from '../../components/ui/button';\n" : ''}import { Link } from 'react-router-dom';
import { useState } from 'react';
import { api, errorMessage } from '../../api/client';

export function Home() {
  const [health, setHealth] = useState('Ready to test');
  const [checking, setChecking] = useState(false);
  async function checkHealth() {
    setChecking(true);
    try { const { data } = await api.get('/health'); setHealth(data.message); }
    catch (err) { setHealth(errorMessage(err)); }
    finally { setChecking(false); }
  }
  ${hasRedux ? `const count = useSelector((state${isTs ? ': any' : ''}) => state.counter.value);
  const dispatch = useDispatch();` : ''}

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Welcome to ${projectName}</h1>
        <p className="mt-2 text-lg leading-relaxed text-muted-foreground">
          Your full-stack MERN project is ready. This is the public website home page mounted under <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">WebsiteLayout</code>.
        </p>
      </div>

      ${hasToastify ? `
      <div>
        ${resolvedStyling === 'shadcn'
          ? `<Button variant="outline" onClick={() => toast.success('React Toastify is working!')}>Test Toast Notification</Button>`
          : `<button type="button" onClick={() => toast.success('React Toastify is working!')} className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Test Toast Notification</button>`
        }
      </div>` : ''}

      ${hasRedux ? `
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <h3 className="text-lg font-semibold text-card-foreground">Redux Toolkit Counter</h3>
        <p className="mt-1 text-sm text-muted-foreground">Current Count: <strong className="font-semibold text-foreground">{count}</strong></p>
        <div className="mt-4 flex items-center gap-2">
          ${resolvedStyling === 'shadcn'
            ? `<Button variant="outline" size="sm" onClick={() => dispatch(decrement())}>-</Button>
          <Button variant="outline" size="sm" onClick={() => dispatch(increment())}>+</Button>`
            : `<button type="button" onClick={() => dispatch(decrement())} className="rounded-md border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted">-</button>
          <button type="button" onClick={() => dispatch(increment())} className="rounded-md border border-border bg-background px-3 py-1 text-sm font-medium hover:bg-muted">+</button>`
          }
        </div>
      </div>` : ''}

      <section className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Connection lab</p>
        <h2 className="my-2 text-2xl font-semibold tracking-tight text-card-foreground">Test the full stack</h2>
        <p className="mb-4 text-sm text-muted-foreground">Send a request through Axios to your Express health endpoint.</p>
        ${resolvedStyling === 'shadcn'
          ? `<Button disabled={checking} onClick={checkHealth}>{checking ? 'Checking…' : 'Check API health'}</Button>`
          : `<button type="button" disabled={checking} onClick={checkHealth} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{checking ? 'Checking…' : 'Check API health'}</button>`
        }
        <p role="status" className="mt-3 text-sm font-medium text-foreground">{health}</p>
      </section>

      <div className="flex flex-wrap gap-5 text-sm font-medium">
        ${hasAuth ? `
        <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
        <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        <Link to="/dashboard" className="text-primary hover:underline">Open dashboard</Link>` : `
        <Link to="/about" className="text-primary hover:underline">About us</Link>
        <Link to="/contact" className="text-primary hover:underline">Contact us</Link>`}
      </div>
    </div>
  );
}
`;

  files[`src/pages/website/About.${ext}`] = `
export function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">About Us</h1>
      <p className="text-muted-foreground text-lg leading-relaxed">
        This application was scaffolded using the custom MERN stack generator with pre-configured routing, sliced layouts, and production-ready folder structures.
      </p>
    </div>
  );
}
`;

  files[`src/pages/website/Contact.${ext}`] = `
export function Contact() {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Contact Us</h1>
      <p className="text-muted-foreground text-lg leading-relaxed">
        Feel free to reach out. Backend email services can be wired through Nodemailer in the server.
      </p>
    </div>
  );
}
`;

  // 11. Dashboard Pages in src/pages/dashboard/ (only when auth enabled)
  if (hasAuth) {
    files[`src/pages/dashboard/Settings.${ext}`] = `import { useOutletContext } from 'react-router-dom';

export function Settings() {
  const { user } = useOutletContext${isTs ? '<{ user: { name: string; email: string; role: string } }>' : ''}();
  return <section className="space-y-4 p-4"><h2 className="text-2xl font-bold">Settings</h2>
    <h3>Account details</h3>
    <dl><dt>Name</dt><dd>{user.name}</dd><dt>Email</dt><dd>{user.email}</dd><dt>Role</dt><dd>{user.role}</dd></dl>
  </section>;
}
`;
  }

  // 12. App.{jsx,tsx} with React Router DOM routes (conditional auth & dashboard)
  if (hasAuth) {
    files[`src/components/PageLoadRecovery.${ext}`] = `export function recoverPageLoad(error${isTs ? ': unknown' : ''}) {
  console.error('Could not load the requested page module.', error);
  return { default: PageLoadRecovery };
}

function PageLoadRecovery() {
  return (
    <main aria-labelledby="page-load-title" className="mx-auto max-w-lg p-6">
      <h1 id="page-load-title" className="text-2xl font-semibold">This page couldn’t load</h1>
      <p role="alert" className="my-4">A new version may be available. Check your connection and refresh to try again.</p>
      <button type="button" className="rounded-md border px-4 py-2" onClick={() => window.location.reload()}>
        Refresh page
      </button>
    </main>
  );
}
`;
    files[`src/App.${ext}`] = `import { lazy, Suspense } from 'react';
import { recoverPageLoad } from './components/PageLoadRecovery';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebsiteLayout } from './layout/WebsiteLayout';
import { Home } from './pages/website/Home';
import { About } from './pages/website/About';
import { Contact } from './pages/website/Contact';
${hasToastify ? `import { ToastContainer } from 'react-toastify';\n` : ''}
const AuthenticatedDashboard = lazy(() => import('./layout/AuthenticatedDashboard').then(module => ({ default: module.AuthenticatedDashboard })).catch(recoverPageLoad));

const Overview = lazy(() => import('./pages/dashboard/Overview').then(module => ({ default: module.Overview })).catch(recoverPageLoad));

const Members = lazy(() => import('./pages/dashboard/Members').then(module => ({ default: module.Members })).catch(recoverPageLoad));

const Settings = lazy(() => import('./pages/dashboard/Settings').then(module => ({ default: module.Settings })).catch(recoverPageLoad));

const Account = lazy(() => import('./pages/auth/Account').then(module => ({ default: module.Account })).catch(recoverPageLoad));

export default function App() {
  return (
    <BrowserRouter>
      ${hasToastify ? '<ToastContainer position="top-right" autoClose={3000} />' : ''}
      <Suspense fallback={<p role="status">Loading page…</p>}>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<WebsiteLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Dashboard Admin Routes */}
          <Route path="/login" element={<Account key="login" mode="login" />} />
          <Route path="/signup" element={<Account key="signup" mode="signup" />} />
          <Route path="/dashboard" element={<AuthenticatedDashboard />}>
            <Route index element={<Overview />} />
            <Route path="settings" element={<Settings />} />
            <Route path="members" element={<Members />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
`;
  } else {
    files[`src/App.${ext}`] = `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebsiteLayout } from './layout/WebsiteLayout';
import { Home } from './pages/website/Home';
import { About } from './pages/website/About';
import { Contact } from './pages/website/Contact';
${hasToastify ? `import { ToastContainer } from 'react-toastify';\n` : ''}
export default function App() {
  return (
    <BrowserRouter>
      ${hasToastify ? '<ToastContainer position="top-right" autoClose={3000} />' : ''}
      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<WebsiteLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
`;
  }

  // 13. main.{jsx,tsx}
  files[`src/main.${ext}`] = `import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
${hasRedux ? `import { Provider } from 'react-redux';
import { store } from './store';` : ''}
ReactDOM.createRoot(document.getElementById('root')${isTs ? '!' : ''}).render(
  <StrictMode>
    ${hasRedux ? '<Provider store={store}><App /></Provider>' : '<App />'}
  </StrictMode>
);
`;

  // 14. Conditional Auth and Styling wiring
  if (hasAuth) {
    addAuthClient(files, { isTs, styling: resolvedStyling });
  } else {
    // Core Axios API client is always available for full-stack connectivity checks
    files[`src/api/client.${scriptExt}`] = `import axios from 'axios';

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
  }

  if (resolvedStyling === 'shadcn') {
    const registry = await addShadcn(files, { isTs, hasAuth });
    Object.assign(dependencies, registry.dependencies);
    Object.assign(devDependencies, registry.devDependencies);
  }

  files['package.json'] = JSON.stringify(clientPkg, null, 2);
  await writeFileTree(targetDir, files);
}

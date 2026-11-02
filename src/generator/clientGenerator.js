import { writeFileTree } from '../utils/fs-helpers.js';
import { sanitizePackageName } from '../utils/naming.js';

export async function generateClient(targetDir, options) {
  const { projectName = 'client', variant = 'js', packages = [] } = options;
  const isTs = variant.startsWith('ts');
  const isCompiler = variant.includes('compiler');
  const ext = isTs ? 'tsx' : 'jsx';
  const scriptExt = isTs ? 'ts' : 'js';

  const hasTailwind = packages.includes('tailwind') || packages.includes('shadcn');
  const hasShadcn = packages.includes('shadcn');
  const hasRedux = packages.includes('redux');
  const hasToastify = packages.includes('toastify');

  const files = {};

  // 1. package.json dependencies
  const dependencies = {
    react: '^19.3.1',
    'react-dom': '^19.3.1',
    'react-router-dom': '^7.18.5'
  };

  const devDependencies = {
    '@vitejs/plugin-react': '^6.2.1',
    oxlint: '^1.90.0',
    vite: '^8.3.5'
  };

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

  if (hasTailwind) {
    devDependencies['tailwindcss'] = '^4.3.3';
    devDependencies['@tailwindcss/vite'] = '^4.3.3';
  }

  if (hasShadcn) {
    dependencies['clsx'] = '^2.1.1';
    dependencies['tailwind-merge'] = '^3.7.0';
    dependencies['lucide-react'] = '^1.66.0';
    dependencies['class-variance-authority'] = '^0.7.1';
  }

  if (hasRedux) {
    dependencies['@reduxjs/toolkit'] = '^2.13.0';
    dependencies['react-redux'] = '^9.3.1';
  }

  if (hasToastify) {
    dependencies['react-toastify'] = '^11.2.0';
  }

  const clientPkg = {
    name: sanitizePackageName(projectName) + '-client',
    private: true,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: isTs ? 'tsc -b && vite build' : 'vite build',
      lint: 'oxlint src --deny-warnings',
      preview: 'vite preview'
    },
    dependencies,
    devDependencies
  };

  files['package.json'] = JSON.stringify(clientPkg, null, 2);

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
${isCompiler ? "import babel from '@rolldown/plugin-babel';" : ''}
${hasTailwind ? "import tailwindcss from '@tailwindcss/vite';" : ''}
${hasShadcn ? "import path from 'node:path';" : ''}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()${isCompiler ? ',\n    babel({ presets: [reactCompilerPreset()] })' : ''}${hasTailwind ? ',\n    tailwindcss()' : ''}
  ],
  server: {
    proxy: { '/api': 'http://localhost:5000' },
    port: 3000
  }${hasShadcn ? `,
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src')
    }
  }` : ''}
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
        ...(hasShadcn ? {
          paths: {
            "@/*": ["./src/*"]
          }
        } : {})
      },
      include: ["src"]
    }, null, 2);
  }

  // 5. Tailwind & Shadcn configs
  if (hasShadcn) {
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

    files[`src/lib/utils.${scriptExt}`] = `import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs${isTs ? ': import("clsx").ClassValue[]' : ''}) {
  return twMerge(clsx(inputs));
}
`;

    // Add sample Shadcn Button
    files[`src/components/ui/button.${ext}`] = `import { cn } from '../../lib/utils';

export function Button({ className, children, ...props }${isTs ? ': React.ButtonHTMLAttributes<HTMLButtonElement>' : ''}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 shadow",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
`;
  }

  // 5b. Shared components in src/components/
  files[`src/components/Card.${ext}`] = `
export function Card({ title, children }${isTs ? ': { title?: string; children: React.ReactNode }' : ''}) {
  return (
    <div style={{ background: '#ffffff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      {title && <h3 style={{ marginTop: 0, marginBottom: '0.75rem', fontSize: '1.2rem', color: '#1e293b' }}>{title}</h3>}
      <div>{children}</div>
    </div>
  );
}
`;

  // 6. index.css
  let indexCss = '';
  if (hasTailwind) {
    indexCss += `@import "tailwindcss";

`;
  }
  indexCss += `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: #f8fafc;
  color: #0f172a;
}
`;
  files['src/index.css'] = indexCss;

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

  // 8. Slices in src/layout/slices/
  files[`src/layout/slices/Navbar.${ext}`] = `import { Link } from 'react-router-dom';

export function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#1e293b' }}>${projectName}</Link>
      </div>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#475569' }}>Home</Link>
        <Link to="/about" style={{ textDecoration: 'none', color: '#475569' }}>About</Link>
        <Link to="/contact" style={{ textDecoration: 'none', color: '#475569' }}>Contact</Link>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 600 }}>Dashboard →</Link>
      </div>
    </nav>
  );
}
`;

  files[`src/layout/slices/Footer.${ext}`] = `
export function Footer() {
  return (
    <footer style={{ padding: '1.5rem 2rem', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>
      <p style={{ margin: 0 }}>© {new Date().getFullYear()} ${projectName}. Built with MERN Stack Generator.</p>
    </footer>
  );
}
`;

  files[`src/layout/slices/Sidebar.${ext}`] = `import { Link } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside style={{ width: '240px', background: '#0f172a', color: '#f8fafc', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', color: '#38bdf8' }}>Dashboard</h3>
      <Link to="/dashboard" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '0.5rem', borderRadius: '4px' }}>Overview</Link>
      <Link to="/dashboard/settings" style={{ color: '#cbd5e1', textDecoration: 'none', padding: '0.5rem', borderRadius: '4px' }}>Settings</Link>
      <div style={{ marginTop: 'auto', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Back to Website</Link>
      </div>
    </aside>
  );
}
`;

  files[`src/layout/slices/Header.${ext}`] = `
export function Header() {
  return (
    <header style={{ height: '60px', background: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem' }}>
      <span style={{ fontWeight: 600, color: '#334155' }}>Admin Portal</span>
      <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Connected to Express + MongoDB</span>
    </header>
  );
}
`;

  // 9. Parent Layouts in src/layout/
  files[`src/layout/WebsiteLayout.${ext}`] = `import { Outlet } from 'react-router-dom';
import { Navbar } from './slices/Navbar';
import { Footer } from './slices/Footer';

export function WebsiteLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
`;

  files[`src/layout/DashboardLayout.${ext}`] = `import { Outlet } from 'react-router-dom';
import { Sidebar } from './slices/Sidebar';
import { Header } from './slices/Header';

export function DashboardLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '2rem', background: '#f8fafc' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
`;

  // 10. Website Pages in src/pages/website/
  files[`src/pages/website/Home.${ext}`] = `${hasRedux ? `import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from '../../store/slices/counterSlice';` : ''}
${hasToastify ? `import { toast } from 'react-toastify';` : ''}
${hasShadcn ? `import { Button } from '../../components/ui/button';` : ''}

export function Home() {
  ${hasRedux ? `const count = useSelector((state${isTs ? ': any' : ''}) => state.counter.value);
  const dispatch = useDispatch();` : ''}

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to ${projectName}</h1>
      <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6' }}>
        Your full-stack MERN project is ready. This is the public website home page mounted under <code>WebsiteLayout</code>.
      </p>

      ${hasToastify ? `
      <div style={{ marginTop: '1.5rem' }}>
        <button
          onClick={() => toast.success('React Toastify is working!')}
          style={{ padding: '0.6rem 1.2rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Test Toast Notification
        </button>
      </div>` : ''}

      ${hasRedux ? `
      <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3>Redux Toolkit Counter</h3>
        <p>Current Count: <strong>{count}</strong></p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => dispatch(decrement())} style={{ padding: '0.4rem 0.8rem' }}>-</button>
          <button onClick={() => dispatch(increment())} style={{ padding: '0.4rem 0.8rem' }}>+</button>
        </div>
      </div>` : ''}

      ${hasShadcn ? `
      <div style={{ marginTop: '2rem' }}>
        <Button onClick={() => alert('Shadcn Button clicked!')}>Shadcn UI Button</Button>
      </div>` : ''}
    </div>
  );
}
`;

  files[`src/pages/website/About.${ext}`] = `
export function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>About Us</h1>
      <p style={{ color: '#475569', lineHeight: '1.6' }}>
        This application was scaffolded using the custom MERN stack generator with pre-configured routing, sliced layouts, and production-ready folder structures.
      </p>
    </div>
  );
}
`;

  files[`src/pages/website/Contact.${ext}`] = `
export function Contact() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Contact Us</h1>
      <p style={{ color: '#475569', lineHeight: '1.6' }}>
        Feel free to reach out. Backend email services can be wired through Nodemailer in the server.
      </p>
    </div>
  );
}
`;

  // 11. Dashboard Pages in src/pages/dashboard/
  files[`src/pages/dashboard/Overview.${ext}`] = `import { useEffect, useState } from 'react';

export function Overview() {
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(data.message || 'Connected'))
      .catch(() => setServerStatus('Backend server is not running on port 5000'));
  }, []);

  return (
    <div>
      <h2>Dashboard Overview</h2>
      <p style={{ color: '#475569' }}>Welcome to the admin dashboard, nested inside <code>DashboardLayout</code>.</p>
      <div style={{ padding: '1rem', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
        <strong>Backend API Status:</strong> <span style={{ color: serverStatus.includes('not') ? '#ef4444' : '#10b981' }}>{serverStatus}</span>
      </div>
    </div>
  );
}
`;

  files[`src/pages/dashboard/Settings.${ext}`] = `
export function Settings() {
  return (
    <div>
      <h2>Settings</h2>
      <p style={{ color: '#475569' }}>Manage your application and account configuration.</p>
    </div>
  );
}
`;

  // 12. App.{jsx,tsx} with React Router DOM routes
  files[`src/App.${ext}`] = `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { WebsiteLayout } from './layout/WebsiteLayout';
import { DashboardLayout } from './layout/DashboardLayout';
import { Home } from './pages/website/Home';
import { About } from './pages/website/About';
import { Contact } from './pages/website/Contact';
import { Overview } from './pages/dashboard/Overview';
import { Settings } from './pages/dashboard/Settings';
${hasToastify ? `import { ToastContainer } from 'react-toastify';
` : ''}

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

        {/* Dashboard Admin Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
`;

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

  await writeFileTree(targetDir, files);
}

import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, ArrowLeft, Layout, Columns, Layers, Smartphone } from "lucide-react";

export const metadata = {
  title: "Sliced Layout Architecture | create-modern-mern-app Documentation",
  description: "Learn about the client layout architecture, React Router v7, sliced layouts, and lazy chunk loading."
};

export default function ArchitectureDocsPage() {
  return (
    <article className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted mb-4">
          Client Architecture
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Sliced Layouts & Routing Architecture
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          How create-modern-mern-app organizes the frontend into dedicated shells, sliced layout components, and lazy-loaded routes with React Router.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">1. Sliced Shell Organization</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Instead of monolithic page wrappers, navigation and shell components are sliced into <code>client/src/layout/slices/</code>:
        </p>
        <div className="rounded-lg border border-border bg-surface/30 p-4 font-mono text-xs space-y-1.5 text-foreground">
          <div className="text-primary font-semibold">client/src/layout/</div>
          <div>├── WebsiteLayout.tsx       # Public shell (Navbar + Content + Footer)</div>
          <div>├── DashboardLayout.tsx     # Authenticated shell (Sidebar + Header + Outlet)</div>
          <div>└── slices/</div>
          <div>    ├── Navbar.tsx          # Public navigation bar</div>
          <div>    ├── Footer.tsx          # Public website footer</div>
          <div>    ├── Sidebar.tsx         # shadcn AppSidebar slice with collapsible nav</div>
          <div>    └── Header.tsx          # Dashboard site header slice with SidebarTrigger</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">2. Route Registration & Lazy Loading (`client/src/App.tsx`)</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          All protected and heavy dashboard routes are dynamically split into asynchronous chunks:
        </p>
        <CodeBlock
          title="App.tsx Route Hierarchy"
          language="typescript"
          code={`import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { WebsiteLayout } from './layout/WebsiteLayout';
import { Home } from './pages/website/Home';
import { About } from './pages/website/About';
import { Contact } from './pages/website/Contact';

const Account = lazy(() => import('./pages/auth/Account'));
const DashboardLayout = lazy(() => import('./layout/DashboardLayout'));
const Overview = lazy(() => import('./pages/dashboard/Overview'));
const Members = lazy(() => import('./pages/dashboard/Members'));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Website Routes */}
        <Route element={<WebsiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Account mode="login" />} />
          <Route path="/signup" element={<Account mode="signup" />} />
        </Route>

        {/* Authenticated Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="members" element={<Members />} />
        </Route>
      </Routes>
    </Suspense>
  );
}`}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">3. Shared API Client (`client/src/api/client.js`)</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          All client-side requests utilize a shared Axios instance with automatic credential attachment, CSRF verification header (<code>X-Requested-With: mern-client</code>), and environment URL fallback.
        </p>
      </div>

      <div className="pt-6 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/auth"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dual-Token Auth
        </Link>
        <Link
          href="/docs/shadcn"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity transition-colors"
        >
          shadcn/ui Models
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

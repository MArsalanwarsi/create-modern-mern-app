import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowLeft, ShieldAlert, Cpu, Terminal, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Production Hardening & Verification | create-modern-mern-app Documentation",
  description: "Security best practices, rate limiting, Helmet headers, Playwright testing, and production deployment."
};

export default function ProductionDocsPage() {
  return (
    <article className="space-y-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted mb-4">
          Production & Deployment
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Production Hardening & Verification
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          How applications generated with create-modern-mern-app maintain security, performance, and reliability in production.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">1. Security Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-surface/30 p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">Helmet Security Headers</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Standardized HTTP headers preventing MIME sniffing, XSS, and clickjacking attacks.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface/30 p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">Scoped CORS Policy</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Restricts cross-origin API access strictly to your client URL with <code>credentials: true</code>.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface/30 p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">CSRF Protection</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Enforces <code>X-Requested-With: mern-client</code> headers on all state-modifying requests.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface/30 p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">Brute-Force Rate Limiting</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Shared IP rate limiting on login and registration with opt-in MongoDB store for multi-replica setups.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">2. Building for Production</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          From the workspace root, run the unified build script to bundle both client and server:
        </p>
        <CodeBlock code="npm run build" language="bash" />
        <p className="text-sm text-text-muted">
          This compiles TypeScript server files into NodeNext ES Modules and builds the Vite frontend into optimized static assets.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">3. Running Production Tests</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Test your application using the integrated test harness:
        </p>
        <CodeBlock code="npm test" language="bash" />
      </div>

      <div className="pt-6 border-t border-border/80 flex justify-between items-center">
        <Link
          href="/docs/ui"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Landing Page & UI
        </Link>
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity transition-colors"
        >
          Back to Quickstart
        </Link>
      </div>
    </article>
  );
}

import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, CheckCircle2, Terminal, Shield, Zap, Layers } from "lucide-react";

export const metadata = {
  title: "Introduction | create-modern-mern-app Documentation",
  description: "Learn how create-modern-mern-app scaffolds a modern, production-grade full-stack MERN app with React 19, Express 5, and MongoDB."
};

export default function DocsPage() {
  return (
    <article className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted mb-4">
          Documentation Overview
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Introduction to create-modern-mern-app
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          <strong>create-modern-mern-app</strong> is an interactive CLI generator that creates an enterprise-ready full-stack workspace featuring React 19, Express 5, MongoDB, Vite, and official shadcn/ui models.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-surface/50 p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">One-Command Initialization</h3>
        <p className="text-sm text-text-muted">
          Run the CLI directly via npx. No global packages required:
        </p>
        <CodeBlock code="npx create-modern-mern-app@latest my-app" language="bash" />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Core Architecture Pillars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-surface/40 p-5 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-foreground font-semibold">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">React 19 & Vite 8</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Instant Hot Module Replacement, optimized Rollup production bundling, and zero configuration for React 19.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/40 p-5 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-foreground font-semibold">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Express 5 & Security</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Native async route error handling, Helmet security headers, scoped CORS, and CSRF protection on API routes.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/40 p-5 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-foreground font-semibold">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Sliced Layouts</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Clean separation between the public marketing layout and the protected authenticated dashboard layout.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-surface/40 p-5 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-foreground font-semibold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">shadcn/ui New York Models</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Official dashboard-01, login-01, and signup-01 models pre-bundled offline without remote dependencies.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-border flex justify-between items-center">
        <span className="text-sm text-text-muted">Next step</span>
        <Link
          href="/docs/quickstart"
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity transition-colors"
        >
          Quickstart Guide
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

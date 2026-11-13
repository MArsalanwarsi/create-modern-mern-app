"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CodeBlock } from "@/components/CodeBlock";
import { 
  Terminal, 
  ArrowRight, 
  Check, 
  Copy, 
  Layers, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Database, 
  KeyRound, 
  Box, 
  Code2, 
  ExternalLink 
} from "lucide-react";
import gsap from "gsap";

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const installCommand = "npx create-modern-mern-app@latest";

  useEffect(() => {
    if (heroRef.current) {
      gsap.from(heroRef.current.querySelectorAll(".animate-in"), {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: "power2.out",
      });
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* 1. Hero Section (Asana Design System & React Docs Style) */}
        <section ref={heroRef} className="pt-16 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="max-w-4xl space-y-6">
            <div className="animate-in inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-text-muted shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              MERN Stack 2026 Edition (React 19 + Express 5 + MongoDB)
            </div>

            <h1 className="animate-in text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08]">
              The foundation for production full-stack MERN apps.
            </h1>

            <p className="animate-in text-lg sm:text-xl text-text-muted max-w-2xl leading-relaxed">
              Interactive CLI scaffolding modern workspaces with React 19, Express 5 REST APIs, MongoDB, Vite 8, dual-token authentication, and official shadcn/ui models.
            </p>

            <div className="animate-in flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/docs/quickstart"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary hover:bg-primary-hover shadow-sm transition-all"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/docs/models"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground hover:bg-surface-hover transition-all"
              >
                Explore Models
              </Link>
            </div>

            {/* Quick Install Bar */}
            <div className="animate-in pt-4">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-border bg-surface p-2 sm:p-2.5 max-w-xl w-full shadow-xs">
                <Terminal className="w-4 h-4 text-text-muted ml-2" />
                <code className="text-xs sm:text-sm font-mono text-foreground flex-1 truncate">
                  {installCommand}
                </code>
                <button
                  onClick={copyToClipboard}
                  aria-label="Copy install command"
                  className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Terminal Demo Preview */}
        <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="rounded-2xl border border-border bg-surface/40 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 text-xs font-mono text-text-muted">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2">terminal — npx create-modern-mern-app@latest</span>
              </div>
              <span>bash</span>
            </div>
            <div className="p-6 font-mono text-xs sm:text-sm text-foreground space-y-2 bg-background/50 leading-relaxed overflow-x-auto">
              <div className="text-text-muted">Modern MERN v3.0.7</div>
              <div className="text-text-muted">Full-stack application setup</div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold pt-2">
                ✔ Select language & compiler: TypeScript with React Compiler
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✔ Choose styling system: shadcn/ui (New York model)
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✔ Include authentication & dashboard: Yes (Dual token + HTTP-only cookies)
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                ✔ Extra add-ons: Redux Toolkit, Toastify, CORS, Dotenv
              </div>
              <div className="pt-2 text-text-muted">
                o Project files created. Ready to build.
              </div>
            </div>
          </div>
        </section>

        {/* 3. Models & Architecture Showcase */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-border">
          <div className="max-w-2xl mb-12 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Production Architecture Explained
            </h2>
            <p className="text-text-muted text-base leading-relaxed">
              Every model and abstraction is engineered for high maintainability, clear contracts, and zero cognitive bloat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border bg-surface/30 p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">User Model & RBAC</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Mongoose schema with bcrypt hashing, projections excluding passwords by default, and strict role enumeration for member and admin scopes.
              </p>
              <Link href="/docs/models" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                Read Model Specs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-surface/30 p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Dual-Token Authentication</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Extracts Bearer tokens from request headers first (Postman/mobile) with automatic fallback to HTTP-only cookies for browsers.
              </p>
              <Link href="/docs/auth" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                Read Auth Guide <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-surface/30 p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center text-foreground">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Sliced Layout System</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Independent public and dashboard shells with decoupled layout slices for navigation, sidebar, and headers, with lazy chunking.
              </p>
              <Link href="/docs/architecture" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                Read Layout Specs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4. shadcn/ui Model Parity Section */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-border">
          <div className="rounded-3xl border border-border bg-surface/40 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-text-muted border border-border">
                shadcn/ui New York Parity
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Official registry blocks pre-bundled offline.
              </h2>
              <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                Experience full fidelity with official dashboard-01, login-01, and signup-01 registry models. Includes Tabler icons, Recharts interactive graphs, and TanStack Table sorting.
              </p>
              <div className="pt-2">
                <Link
                  href="/docs/shadcn"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors"
                >
                  View shadcn Guide
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="w-full md:w-auto rounded-2xl border border-border bg-background p-4 shadow-sm font-mono text-xs space-y-2 text-text-muted">
              <div className="text-foreground font-semibold">Bundled Components:</div>
              <div>• SectionCards (4 Metric Tiles)</div>
              <div>• ChartAreaInteractive (Recharts)</div>
              <div>• DataTable (TanStack + DnD)</div>
              <div>• AppSidebar & NavUser</div>
              <div>• LoginForm & SignupForm</div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { 
  Terminal, 
  Layers, 
  ShieldCheck, 
  Box, 
  ArrowRight, 
  Copy, 
  Check, 
  Sparkles,
  Zap,
  Globe
} from "lucide-react";
import gsap from "gsap";

const wizardSteps = [
  { prompt: "Project name", value: "mern-saas-platform", note: "Auto-sanitized to valid npm workspace" },
  { prompt: "Language & Compiler", value: "TypeScript with React 19 Compiler", note: "Zero useMemo/useCallback overhead" },
  { prompt: "Styling Framework", value: "Tailwind CSS v4 + shadcn/ui", note: "Official New York blocks & tokens" },
  { prompt: "Authentication", value: "Yes (JWT cookies + bcryptjs + RBAC)", note: "Dual-token bearer & cookie auth" },
  { prompt: "Server Add-ons", value: "Helmet, CORS, Dotenv, Rate Limiter", note: "Production security middleware suite" }
];

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".hero-item", {
        y: 16,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out"
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const copyCommand = async () => {
    await navigator.clipboard.writeText("npx create-modern-mern-app@latest my-app");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={heroRef} className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="pt-10 sm:pt-16 max-w-4xl mx-auto text-center space-y-6">
        <div className="hero-item inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>v3.0.8 Released with Official shadcn Parity</span>
        </div>

        <h1 className="hero-item text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          Modern MERN architecture. <br />
          <span className="text-text-muted font-normal">Engineered for production.</span>
        </h1>

        <p className="hero-item text-base sm:text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
          Scaffold production-grade full-stack MERN workspaces in seconds with React 19, Express 5, Vite, MongoDB, and authentic shadcn/ui models.
        </p>

        {/* Quick Install Bar */}
        <div className="hero-item flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-4 py-2.5 max-w-md w-full font-mono text-xs text-foreground shadow-xs">
            <span className="text-text-muted">$</span>
            <span className="flex-1 text-left font-medium">npx create-modern-mern-app@latest my-app</span>
            <button
              onClick={copyCommand}
              aria-label="Copy CLI command"
              className="p-1 rounded-md border border-border bg-background text-text-muted hover:text-foreground transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <Link
            href="/docs/quickstart"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-5 py-2.5 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
          >
            Documentation
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Terminal Wizard Interactive Showcase */}
      <section className="max-w-4xl mx-auto">
        <div className="rounded-lg border border-border bg-[#0d0e10] overflow-hidden shadow-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#22272b] bg-[#14171a]/90 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/80" />
              <span className="ml-2 text-[#8c9ba5]">Modern MERN CLI v3.0.8 Setup Wizard</span>
            </div>
            <span className="text-[11px] text-[#8c9ba5] uppercase tracking-wider font-semibold">Interactive</span>
          </div>

          <div className="p-6 font-mono text-xs sm:text-sm text-[#f4f5f7] space-y-4">
            <div className="text-[#8c9ba5]">
              ? What would you like to configure for your MERN workspace?
            </div>

            <div className="space-y-2">
              {wizardSteps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${
                    activeStep === idx
                      ? "border-emerald-500/50 bg-[#1b2229] text-[#f4f5f7]"
                      : "border-[#22272b] bg-[#14171a]/50 text-[#8c9ba5] hover:border-[#2c333a]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeStep === idx ? "bg-emerald-400" : "bg-[#505961]"}`} />
                    <span className="font-semibold">{step.prompt}:</span>
                    <span className="text-emerald-300">{step.value}</span>
                  </div>
                  <span className="text-[11px] text-[#8c9ba5] sm:text-right">{step.note}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#22272b] flex items-center justify-between text-xs text-[#8c9ba5]">
              <span>Click any step to inspect generated monorepo contract</span>
              <span className="text-emerald-400 font-semibold">✔ Ready to scaffold</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Architecture Showcase */}
      <section className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Built for modern engineering standards
          </h2>
          <p className="text-sm text-text-muted max-w-xl mx-auto">
            Everything you need for an enterprise-ready foundation without template debt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-lg border border-border bg-card p-6 space-y-3 shadow-xs hover:border-foreground/30 transition-colors">
            <div className="h-9 w-9 rounded-md bg-surface border border-border flex items-center justify-center text-foreground">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">React 19 & Sliced Layouts</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Vite dev server with React Router DOM code-splitting, PublicLayout and DashboardLayout slices, and React 19 Compiler support.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3 shadow-xs hover:border-foreground/30 transition-colors">
            <div className="h-9 w-9 rounded-md bg-surface border border-border flex items-center justify-center text-foreground">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Dual-Token Auth & RBAC</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Support for both HTTP-only session cookies and Authorization Bearer headers. Strict member vs admin role authorization guards.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 space-y-3 shadow-xs hover:border-foreground/30 transition-colors">
            <div className="h-9 w-9 rounded-md bg-surface border border-border flex items-center justify-center text-foreground">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-foreground">Official shadcn/ui Parity</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Offline-bundled New York style blocks for dashboard-01, login-01, and signup-01 with preconfigured components.json.
            </p>
          </div>
        </div>
      </section>

      {/* Model & Dashboard Showcase */}
      <section className="max-w-5xl mx-auto">
        <div className="rounded-lg border border-border bg-surface p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="space-y-3 max-w-lg">
            <span className="rounded-md bg-background px-2.5 py-1 text-xs font-mono font-medium text-text-muted border border-border">
              client/src/pages/Overview.tsx
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              Full shadcn dashboard-01 parity
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Includes interactive Recharts graphs, 4 summary metric tiles, and sortable TanStack data tables with zero manual styling needed.
            </p>
            <div className="pt-2">
              <Link
                href="/docs/shadcn"
                className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-90 transition-opacity"
              >
                Inspect shadcn Architecture
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="w-full md:w-auto rounded-lg border border-border bg-background p-4 font-mono text-xs space-y-2 text-text-muted shadow-xs">
            <div className="text-foreground font-semibold flex items-center gap-2">
              <Box className="w-4 h-4 text-emerald-500" />
              <span>Components Included:</span>
            </div>
            <div className="pl-6 space-y-1">
              <div>✔ button, input, label, card</div>
              <div>✔ table, dialog, dropdown-menu</div>
              <div>✔ area-chart, metric-tiles</div>
              <div>✔ lucide-react icon library</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

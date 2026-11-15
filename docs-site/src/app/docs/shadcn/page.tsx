import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, ArrowLeft, Layers, Sparkles, Check, Package, LayoutDashboard, LogIn, UserPlus } from "lucide-react";

export const metadata = {
  title: "shadcn/ui Models & Component Parity | create-modern-mern-app Documentation",
  description: "Official shadcn/ui dashboard-01, login-01, and signup-01 models, components.json v4 config, and asset architecture."
};

export default function ShadcnDocsPage() {
  return (
    <article className="space-y-10">
      {/* Header section with distinct typography hierarchy */}
      <div className="space-y-3 pb-6 border-b border-border/80/80">
        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-mono font-medium text-text-muted">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>UI Component Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          shadcn/ui Models & Component Parity
        </h1>
        <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-3xl">
          How create-modern-mern-app delivers exact, 100% parity with official shadcn/ui models (New York style) with complete offline bundling.
        </p>
      </div>

      {/* Model Cards Section */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            1. Bundled Official Models
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-text-muted">
            The CLI generator writes production-tested New York templates directly into your client workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* dashboard-01 Card */}
          <div className="group relative rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs hover:border-foreground/40 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface text-text-muted border border-border">
                  Model 01
                </span>
              </div>
              <h3 className="text-sm font-bold font-mono text-foreground pt-1">
                dashboard-01
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                4 metric cards with Tabler icons, interactive Recharts AreaChart, and TanStack React Table with drag-and-drop sortable rows.
              </p>
            </div>
            <div className="pt-2 border-t border-border/80/60 text-[11px] font-mono text-text-muted flex items-center justify-between">
              <span>Overview.tsx</span>
              <span className="text-emerald-500 font-medium">Bundled</span>
            </div>
          </div>

          {/* login-01 Card */}
          <div className="group relative rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs hover:border-foreground/40 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                  <LogIn className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface text-text-muted border border-border">
                  Model 02
                </span>
              </div>
              <h3 className="text-sm font-bold font-mono text-foreground pt-1">
                login-01
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Card wrapper with FieldGroup, FieldLabel, input validation, and password recovery placeholders.
              </p>
            </div>
            <div className="pt-2 border-t border-border/80/60 text-[11px] font-mono text-text-muted flex items-center justify-between">
              <span>Login.tsx</span>
              <span className="text-emerald-500 font-medium">Bundled</span>
            </div>
          </div>

          {/* signup-01 Card */}
          <div className="group relative rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs hover:border-foreground/40 hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground group-hover:scale-105 transition-transform">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface text-text-muted border border-border">
                  Model 03
                </span>
              </div>
              <h3 className="text-sm font-bold font-mono text-foreground pt-1">
                signup-01
              </h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Full name, email, password, and confirmation with instant client-side password matching validation.
              </p>
            </div>
            <div className="pt-2 border-t border-border/80/60 text-[11px] font-mono text-text-muted flex items-center justify-between">
              <span>Signup.tsx</span>
              <span className="text-emerald-500 font-medium">Bundled</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="space-y-4 pt-4 border-t border-border/80/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            2. Official `components.json` Configuration
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-text-muted leading-relaxed">
            The scaffolded project includes a pre-configured <code>components.json</code> with all necessary path aliases. You can run <code>npx shadcn@latest add &lt;component&gt;</code> without manual directory prompts:
          </p>
        </div>

        <CodeBlock
          title="client/components.json"
          language="json"
          code={`{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}`}
        />
      </div>

      {/* Adding Components Section */}
      <div className="space-y-4 pt-4 border-t border-border/80/80">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            3. Adding More shadcn Primitives
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-text-muted leading-relaxed">
            Because the CLI configures official path aliases and Tailwind v4 themes out of the box, extending your UI is seamless:
          </p>
        </div>

        <CodeBlock
          title="Terminal (Inside client workspace)"
          language="bash"
          code={`cd client
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add table
npx shadcn@latest add avatar`}
        />
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-8 border-t border-border/80/80">
        <Link
          href="/docs/architecture"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sliced Layouts & Routing</span>
        </Link>
        <Link
          href="/docs/ui"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-xs sm:text-sm font-semibold text-background hover:opacity-90 transition-opacity"
        >
          <span>Landing Page & UI Design</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

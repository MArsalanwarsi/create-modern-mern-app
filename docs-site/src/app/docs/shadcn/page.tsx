import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, ArrowLeft, Layers, Sparkles, Check, Package } from "lucide-react";

export const metadata = {
  title: "shadcn/ui Models & Component Parity | create-modern-mern-app Documentation",
  description: "Official shadcn/ui dashboard-01, login-01, and signup-01 models, components.json v4 config, and asset architecture."
};

export default function ShadcnDocsPage() {
  return (
    <article className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted mb-4">
          UI Component System
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          shadcn/ui Models & Component Parity
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          How create-modern-mern-app delivers exact, 100% parity with official shadcn/ui models (New York style) with complete offline bundling.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">1. Bundled Official Models</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">dashboard-01</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              4 metric cards with Tabler icons, interactive Recharts AreaChart, and TanStack React Table with drag-and-drop sortable rows.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">login-01</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Card wrapper with FieldGroup, FieldLabel, input validation, and password recovery placeholders.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface/40 p-5 space-y-2">
            <h3 className="text-base font-semibold text-foreground">signup-01</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              Full name, email, password, and confirmation with instant client-side password matching validation.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">2. Official `components.json` Configuration</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          The scaffolded project includes a pre-configured <code>components.json</code> with all necessary path aliases. You can run <code>npx shadcn@latest add &lt;component&gt;</code> without manual directory prompts:
        </p>
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
    "baseColor": "slate",
    "cssVariables": true
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

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">3. Adding More Components</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Navigate into <code>client/</code> and install any additional shadcn primitive:
        </p>
        <CodeBlock code="cd client && npx shadcn@latest add dialog calendar popover" language="bash" />
      </div>

      <div className="pt-6 border-t border-border flex justify-between items-center">
        <Link
          href="/docs/architecture"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Sliced Layouts
        </Link>
        <Link
          href="/docs/ui"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors"
        >
          Landing Page & UI
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

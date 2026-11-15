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
        <div className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-muted mb-4">
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
          <div className="rounded-lg border border-border bg-card p-5 space-y-2.5 shadow-sm hover:border-foreground/30 transition-colors">
            <h3 className="text-sm font-semibold font-mono text-foreground">dashboard-01</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              4 metric cards with Tabler icons, interactive Recharts AreaChart, and TanStack React Table with drag-and-drop sortable rows.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 space-y-2.5 shadow-sm hover:border-foreground/30 transition-colors">
            <h3 className="text-sm font-semibold font-mono text-foreground">login-01</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Card wrapper with FieldGroup, FieldLabel, input validation, and password recovery placeholders.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 space-y-2.5 shadow-sm hover:border-foreground/30 transition-colors">
            <h3 className="text-sm font-semibold font-mono text-foreground">signup-01</h3>
            <p className="text-xs text-text-muted leading-relaxed">
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

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">3. Adding More shadcn Primitives</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Because the CLI configures official path aliases and Tailwind v4 themes out of the box, extending your UI is seamless:
        </p>

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

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Link
          href="/docs/architecture"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Sliced Layouts & Routing
        </Link>
        <Link
          href="/docs/ui"
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition-opacity"
        >
          Landing Page & UI Design
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

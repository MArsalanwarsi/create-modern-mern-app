import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Quickstart & Setup | create-modern-mern-app Documentation",
  description: "Step-by-step installation and setup guide for create-modern-mern-app CLI."
};

export default function QuickstartPage() {
  return (
    <article className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-muted mb-4">
          Setup Instructions
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Quickstart & Interactive Wizard
        </h1>
        <p className="mt-3 text-lg text-text-muted leading-relaxed">
          Create and run your MERN stack application in less than two minutes.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">1. System Prerequisites</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Before running the CLI, make sure your local environment meets these requirements:
        </p>
        <ul className="list-disc list-inside text-sm text-text-muted space-y-1.5 ml-2">
          <li><strong>Node.js:</strong> v24.16.0 or newer (uses native Node ESM, test runner, and permissions)</li>
          <li><strong>Package Manager:</strong> npm (v10+ recommended)</li>
          <li><strong>Database:</strong> Local MongoDB instance or free MongoDB Atlas cluster connection string</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">2. Run the Interactive Wizard</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Launch the generator in your terminal by passing your desired project directory:
        </p>
        <CodeBlock code="npx create-modern-mern-app@latest my-app" language="bash" />
        <p className="text-sm text-text-muted">
          The Clack-powered CLI wizard will guide you through:
        </p>
        <div className="rounded-xl border border-border bg-surface/30 p-4 font-mono text-xs space-y-2 text-foreground">
          <div>? Select language and compiler (TypeScript, React Compiler, or JavaScript)</div>
          <div>? Choose styling system (shadcn/ui, Tailwind CSS v4, or clean CSS)</div>
          <div>? Include authentication and protected dashboard (Yes/No)</div>
          <div>? Select extra integrations (Redux Toolkit, Toastify, Cloudinary, Multer, Nodemailer)</div>
          <div>? Install dependencies automatically (Yes/No)</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">3. Unattended / CI Setup</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          You can bypass all interactive prompts by passing explicit CLI flags:
        </p>
        <CodeBlock 
          title="Automated TypeScript + shadcn/ui Scaffold"
          code="npx create-modern-mern-app@latest portal --yes --language ts --styling shadcn --auth --install" 
          language="bash" 
        />
        <CodeBlock 
          title="Lightweight JavaScript + CSS Scaffold"
          code="npx create-modern-mern-app@latest brochure --yes --language js --styling css --no-auth --no-install" 
          language="bash" 
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">4. Configure Environment & Start Development</h2>
        <p className="text-sm text-text-muted leading-relaxed">
          Once created, navigate into your directory and start both client and server concurrently:
        </p>
        <CodeBlock 
          code={`cd my-app
# Optional: customize server/.env with your MongoDB Atlas URI
npm run dev`} 
          language="bash" 
        />
        <p className="text-sm text-text-muted">
          Your frontend will be running at <strong>http://localhost:3000</strong> and your Express 5 backend API at <strong>http://localhost:5000</strong>.
        </p>
      </div>

      <div className="pt-6 border-t border-border flex justify-between items-center">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Introduction
        </Link>
        <Link
          href="/docs/models"
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-on-primary hover:bg-primary-hover transition-colors"
        >
          Models & Schemas
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </article>
  );
}

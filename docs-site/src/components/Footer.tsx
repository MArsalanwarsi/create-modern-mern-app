import Link from "next/link";
import Image from "next/image";
import { Terminal, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50 text-text-muted mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 font-semibold text-foreground">
              <div className="relative h-6 w-6 rounded-md overflow-hidden border border-border">
                <Image
                  src="/logo.svg"
                  alt="create-modern-mern-app logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-semibold text-sm">create-modern-mern-app</span>
            </div>
            <p className="text-sm text-text-muted max-w-sm leading-relaxed">
              Open source CLI generator providing developer-friendly, production-grade full-stack MERN foundations with React 19, Express 5, MongoDB, and shadcn/ui.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Documentation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/docs/quickstart" className="hover:text-foreground transition-colors">Quickstart Guide</Link></li>
              <li><Link href="/docs/models" className="hover:text-foreground transition-colors">Models & Schemas</Link></li>
              <li><Link href="/docs/architecture" className="hover:text-foreground transition-colors">Sliced Layouts</Link></li>
              <li><Link href="/docs/auth" className="hover:text-foreground transition-colors">Dual-Token Auth</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Community & Code</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://github.com/MArsalanwarsi/create-modern-mern-app" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="https://www.npmjs.com/package/create-modern-mern-app" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  npm Package Registry
                </a>
              </li>
              <li>
                <a href="https://github.com/MArsalanwarsi/create-modern-mern-app/issues" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
                  Report an Issue
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© 2026 Muhammad Arsalan Warsi. Released under the MIT License.</p>
          <p className="flex items-center gap-1">
            Engineered with modern full-stack standards.
          </p>
        </div>
      </div>
    </footer>
  );
}

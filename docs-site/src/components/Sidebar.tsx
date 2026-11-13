"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Rocket, 
  Database, 
  Layers, 
  KeyRound, 
  Terminal, 
  Paintbrush, 
  Wrench, 
  ShieldAlert,
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";

const docLinks = [
  {
    category: "Getting Started",
    items: [
      { title: "Introduction & Overview", href: "/docs" },
      { title: "Quickstart & CLI Wizard", href: "/docs/quickstart" },
      { title: "Project Structure", href: "/docs/structure" }
    ]
  },
  {
    category: "Data Models & Backend",
    items: [
      { title: "User & Auth Models", href: "/docs/models" },
      { title: "Controllers & Services", href: "/docs/controllers" },
      { title: "Dual Token & Middlewares", href: "/docs/auth" }
    ]
  },
  {
    category: "Frontend Architecture",
    items: [
      { title: "Sliced Layouts & Routing", href: "/docs/architecture" },
      { title: "shadcn/ui & Models", href: "/docs/shadcn" },
      { title: "Landing Page & UI Design", href: "/docs/ui" }
    ]
  },
  {
    category: "Deployment & Production",
    items: [
      { title: "Production Hardening", href: "/docs/production" },
      { title: "API Reference", href: "/docs/api" }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border bg-surface/30 p-4 md:p-6 md:sticky md:top-16 md:h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        {docLinks.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted px-2">
              {section.category}
            </h4>
            <ul className="space-y-0.5">
              {section.items.map((item, itemIdx) => {
                const isActive = pathname === item.href;
                return (
                  <li key={itemIdx}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition-colors",
                        isActive
                          ? "bg-surface font-semibold text-foreground border border-border shadow-xs"
                          : "text-text-muted hover:text-foreground hover:bg-surface/50"
                      )}
                    >
                      <span>{item.title}</span>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

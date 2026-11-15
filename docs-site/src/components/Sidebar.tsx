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
  ChevronRight,
  FolderTree,
  Cpu,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

const docSections = [
  {
    category: "Getting Started",
    icon: Rocket,
    items: [
      { title: "Introduction & Overview", href: "/docs" },
      { title: "Quickstart & CLI Wizard", href: "/docs/quickstart" },
      { title: "Project Structure", href: "/docs/structure" }
    ]
  },
  {
    category: "Data Models & Backend",
    icon: Database,
    items: [
      { title: "User & Auth Models", href: "/docs/models" },
      { title: "Controllers & Services", href: "/docs/controllers" },
      { title: "Dual Token & Middlewares", href: "/docs/auth" }
    ]
  },
  {
    category: "Frontend Architecture",
    icon: Layers,
    items: [
      { title: "Sliced Layouts & Routing", href: "/docs/architecture" },
      { title: "shadcn/ui & Models", href: "/docs/shadcn" },
      { title: "Landing Page & UI Design", href: "/docs/ui" }
    ]
  },
  {
    category: "Deployment & Production",
    icon: ShieldAlert,
    items: [
      { title: "Production Hardening", href: "/docs/production" },
      { title: "API Reference", href: "/docs/api" }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-border/80 bg-surface/30 p-4 md:p-6 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="space-y-6">
        {docSections.map((section, idx) => {
          const SectionIcon = section.icon;
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted/90">
                <SectionIcon className="w-3.5 h-3.5 text-text-muted" />
                <span>{section.category}</span>
              </div>
              <ul className="space-y-0.5 border-l border-border/60 ml-2 pl-2">
                {section.items.map((item, itemIdx) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={itemIdx}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs sm:text-[13px] font-medium transition-all relative",
                          isActive
                            ? "bg-card text-foreground font-semibold shadow-xs border border-border before:absolute before:-left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-foreground before:rounded-full"
                            : "text-text-muted hover:text-foreground hover:bg-surface/80"
                        )}
                      >
                        <span className="truncate">{item.title}</span>
                        {isActive && (
                          <ChevronRight className="w-3.5 h-3.5 text-foreground shrink-0 ml-1" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

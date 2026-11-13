"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = "bash", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-surface dark:bg-surface overflow-hidden my-4 shadow-sm">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/50 text-xs font-mono text-text-muted">
          <span>{title}</span>
          <span className="uppercase text-[10px] tracking-wider">{language}</span>
        </div>
      )}
      <div className="relative p-4 font-mono text-xs sm:text-sm text-foreground overflow-x-auto leading-relaxed">
        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="absolute right-3 top-3 p-1.5 rounded-md border border-border bg-background text-text-muted hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <pre className="pr-10">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language = "bash",
  title,
  showLineNumbers = false
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");

  const normalizedLanguage = language.toLowerCase();

  useEffect(() => {
    let grammar = Prism.languages[normalizedLanguage];
    if (!grammar) {
      if (normalizedLanguage === "ts" || normalizedLanguage === "typescript") {
        grammar = Prism.languages.typescript || Prism.languages.javascript;
      } else if (normalizedLanguage === "js" || normalizedLanguage === "javascript") {
        grammar = Prism.languages.javascript;
      } else if (normalizedLanguage === "sh" || normalizedLanguage === "shell") {
        grammar = Prism.languages.bash;
      } else {
        grammar = Prism.languages.markup || Prism.languages.javascript;
      }
    }

    try {
      const highlighted = grammar ? Prism.highlight(code, grammar, normalizedLanguage) : code;
      setHighlightedCode(highlighted);
    } catch {
      setHighlightedCode(code);
    }
  }, [code, normalizedLanguage]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  return (
    <div className="relative rounded-lg border border-border bg-[#0d0e10] text-[#f4f5f7] overflow-hidden my-5 shadow-card group">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#22272b] bg-[#14171a]/90 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/80 inline-block" />
          </div>
          {title ? (
            <span className="text-[#8c9ba5] font-medium">{title}</span>
          ) : (
            <div className="flex items-center gap-1 text-[#8c9ba5]">
              <Terminal className="w-3.5 h-3.5" />
              <span>{normalizedLanguage}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-[#22272b] text-[#8c9ba5] font-semibold">
            {language}
          </span>
          <button
            onClick={handleCopy}
            aria-label="Copy code to clipboard"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans text-[#8c9ba5] hover:text-[#f4f5f7] bg-[#22272b]/70 hover:bg-[#2c333a] transition-all border border-[#2c333a]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div className="relative p-4 font-mono text-xs sm:text-[13px] leading-relaxed overflow-x-auto selection:bg-[#2c333a]">
        {showLineNumbers ? (
          <div className="flex">
            <div className="select-none pr-4 text-right text-[#505961] font-mono text-xs border-r border-[#22272b]/80 mr-4">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="flex-1 overflow-x-auto">
              <code
                dangerouslySetInnerHTML={{
                  __html: highlightedCode || code
                }}
              />
            </pre>
          </div>
        ) : (
          <pre className="overflow-x-auto">
            <code
              dangerouslySetInnerHTML={{
                __html: highlightedCode || code
              }}
            />
          </pre>
        )}
      </div>
    </div>
  );
}

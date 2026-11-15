"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useModeAnimation, ThemeAnimationType } from "react-theme-switch-animation";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  const { ref, toggleSwitchTheme } = useModeAnimation({
    animationType: ThemeAnimationType.BLUR_CIRCLE,
    blurAmount: 2.5,
    duration: 650,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    isDarkMode: isDark,
    onDarkModeChange: (nextDark: boolean) => {
      setTheme(nextDark ? "dark" : "light");
    }
  });

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-md border border-border bg-surface/50 opacity-40" />
    );
  }

  return (
    <button
      ref={ref}
      onClick={toggleSwitchTheme}
      aria-label="Toggle visual theme with blur circle transition"
      className="relative flex items-center justify-center w-8 h-8 rounded-md border border-border bg-surface text-text-muted hover:text-foreground hover:bg-surface-hover transition-colors shadow-2xs group cursor-pointer"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform group-hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-foreground transition-transform group-hover:-rotate-12" />
      )}
    </button>
  );
}

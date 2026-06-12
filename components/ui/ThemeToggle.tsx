"use client";

import { useState } from "react";
import { useTheme } from "@/components/ui/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [animating, setAnimating] = useState(false);

  function handleToggle() {
    setAnimating(true);
    toggle();
    setTimeout(() => setAnimating(false), 500);
  }

  return (
    <button
      onClick={handleToggle}
      className="relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-surface-alt active:scale-90"
      aria-label={theme === "light" ? "切换到暗色模式" : "切换到亮色模式"}
      title={theme === "light" ? "暗色模式" : "亮色模式"}
    >
      <span
        className={`text-lg transition-all duration-300 absolute ${
          theme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-50"
        } ${animating ? "animate-theme-toggle" : ""}`}
        aria-hidden="true"
      >
        🌙
      </span>
      <span
        className={`text-lg transition-all duration-300 absolute ${
          theme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-50"
        } ${animating ? "animate-theme-toggle" : ""}`}
        aria-hidden="true"
      >
        ☀️
      </span>
    </button>
  );
}

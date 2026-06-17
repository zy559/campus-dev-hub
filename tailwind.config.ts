import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted)",
        subtle: "var(--subtle)",
        surface: "var(--surface)",
        "surface-alt": "var(--surface-alt)",
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-subtle": "var(--accent-subtle)",
        "accent-soft": "var(--accent-soft)",
        "glass-bg": "var(--glass-bg)",
        "glass-border": "var(--glass-border)",
        "glass-shadow": "var(--glass-shadow)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        error: "var(--error)",
        "error-bg": "var(--error-bg)",
        "error-border": "var(--error-border)",
        success: "var(--success)",
      },
      backdropBlur: {
        glass: "var(--glass-blur)",
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) both",
        "fade-in": "fade-in 0.5s ease both",
        "scale-in": "scale-in 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) both",
        blob: "blob-drift 20s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 2s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;

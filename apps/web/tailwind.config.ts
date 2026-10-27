import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "app-bg": "#080B14",
        "sidebar-bg": "#090D18",
        "card-surface": "#0D1424",
        "elevated-surface": "#121B30",
        "border-hairline": "rgba(255, 255, 255, 0.08)",
        "border-active": "rgba(99, 102, 241, 0.4)",
        "surface-container-lowest": "#060910",
        "surface-container-low": "#0A0F1E",
        "surface-container": "#0E1528",
        "surface-container-high": "#141D34",
        "surface-container-highest": "#1B2642",
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        "text-tertiary": "#64748B",
        primary: "#818cf8",
        "on-primary": "#1e1b4b",
        "primary-container": "#4f46e5",
        "on-primary-container": "#e0e7ff",
        secondary: "#38bdf8",
        "secondary-container": "#0369a1",
        "on-secondary-container": "#e0f2fe",
        accent: "#6366f1",
        success: "#10B981",
        "success-subtle": "rgba(16, 185, 129, 0.12)",
        warning: "#F59E0B",
        "warning-subtle": "rgba(245, 158, 11, 0.12)",
        danger: "#F43F5E",
        "danger-subtle": "rgba(244, 63, 94, 0.12)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(99, 102, 241, 0.35)",
        "glow-purple": "0 0 25px -5px rgba(168, 85, 247, 0.4)",
        "glow-cyan": "0 0 25px -5px rgba(6, 182, 212, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

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
        "app-bg": "#070B18",
        "sidebar-bg": "#0B1020",
        "card-surface": "#11182A",
        "elevated-surface": "#171F34",
        "border-hairline": "#202A40",
        "border-active": "#323F5D",
        "surface-container-lowest": "#090e1b",
        "surface-container-low": "#171b29",
        "surface-container": "#1b1f2d",
        "surface-container-high": "#252938",
        "surface-container-highest": "#303443",
        "text-primary": "#F1F5F9",
        "text-secondary": "#94A3B8",
        "text-tertiary": "#64748B",
        primary: "#c5c0ff",
        "on-primary": "#2400a2",
        "primary-container": "#8a80ff",
        "on-primary-container": "#1f008f",
        secondary: "#c6c0ff",
        "secondary-container": "#4336a7",
        "on-secondary-container": "#b6afff",
        tertiary: "#ffb77b",
        "tertiary-container": "#d47b1f",
        success: "#10B981",
        "success-subtle": "rgba(16, 185, 129, 0.12)",
        warning: "#F59E0B",
        "warning-subtle": "rgba(245, 158, 11, 0.12)",
        danger: "#F43F5E",
        "danger-subtle": "rgba(244, 63, 94, 0.12)",
        "accent-subtle": "rgba(113, 101, 245, 0.14)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;

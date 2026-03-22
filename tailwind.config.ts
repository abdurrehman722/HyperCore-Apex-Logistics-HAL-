import type { Config } from "tailwindcss";
const { nextui } = require("@nextui-org/react");

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "hal-dark": "#0a0e1a",
        "hal-darker": "#060910",
        "hal-card": "#0f1629",
        "hal-border": "#1e2d4a",
        "hal-accent": "#00d4ff",
        "hal-accent2": "#7c3aed",
        "hal-success": "#00ff88",
        "hal-warning": "#ffaa00",
        "hal-danger": "#ff3366",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        dark: {
          colors: {
            background: "#0a0e1a",
            foreground: "#e2e8f0",
            primary: {
              DEFAULT: "#00d4ff",
              foreground: "#000000",
            },
            secondary: {
              DEFAULT: "#7c3aed",
              foreground: "#ffffff",
            },
            success: {
              DEFAULT: "#00ff88",
              foreground: "#000000",
            },
            warning: {
              DEFAULT: "#ffaa00",
              foreground: "#000000",
            },
            danger: {
              DEFAULT: "#ff3366",
              foreground: "#ffffff",
            },
          },
        },
      },
    }),
  ],
};

export default config;

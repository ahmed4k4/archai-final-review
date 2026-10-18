import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        /* Legacy aliases kept so existing class names keep working,
           but every value is now the OFFICIAL brand palette:
           Carbon · Panel · Silver · Arc Blue · Copper. */
        violet: {
          50: "#E6FAFF", 100: "#BDF2FF", 200: "#8AE8FF", 300: "#5CDDFF",
          400: "#2ED2FF", 500: "#17B4E0", 600: "#0E90B8",
          700: "#0A6E8E", 800: "#084F67", 900: "#063646",
        },
        mint: {
          50: "#E6FAFF", 100: "#BDF2FF", 200: "#8AE8FF", 300: "#5CDDFF",
          400: "#2ED2FF", 500: "#17B4E0", 600: "#0E90B8",
          700: "#0A6E8E", 800: "#084F67", 900: "#063646",
        },
        void: {
          50: "#CCD3DA", 100: "#A8B2BC", 200: "#7E8A95", 300: "#55616C",
          400: "#38424B", 500: "#2A333B", 600: "#222B33",
          700: "#1B2228", 800: "#141A1F", 900: "#0E1317",
        },
        /* "rose" slot now carries Copper (secondary accent). */
        rose: {
          50: "#FBF3EC", 100: "#F2DFCC", 200: "#E4C1A2", 300: "#D6A577",
          400: "#C48A5C", 500: "#AE7347", 600: "#8E5A36",
          700: "#6E4529", 800: "#4F311D", 900: "#331F12",
        },
        /* "amber" slot now carries warm Silver/Copper tints. */
        amber: {
          50: "#FBF3EC", 100: "#F2DFCC", 200: "#E4C1A2", 300: "#D6A577",
          400: "#C48A5C", 500: "#AE7347", 600: "#8E5A36",
          700: "#6E4529", 800: "#4F311D", 900: "#331F12",
        },
        silver: {
          50: "#F6F8FA", 100: "#E9EDF0", 200: "#CCD3DA", 300: "#B4BEC7",
          400: "#96A1AC", 500: "#78848F", 600: "#5A656F",
          700: "#414B54", 800: "#2C343B", 900: "#1B2228",
        },
        arc: {
          50: "#E6FAFF", 100: "#BDF2FF", 200: "#8AE8FF", 300: "#5CDDFF",
          400: "#2ED2FF", 500: "#17B4E0", 600: "#0E90B8",
          700: "#0A6E8E", 800: "#084F67", 900: "#063646",
        },
        copper: {
          50: "#FBF3EC", 100: "#F2DFCC", 200: "#E4C1A2", 300: "#D6A577",
          400: "#C48A5C", 500: "#AE7347", 600: "#8E5A36",
          700: "#6E4529", 800: "#4F311D", 900: "#331F12",
        },
        carbon: {
          50: "#E9EDF0", 100: "#CCD3DA", 200: "#A8B2BC", 300: "#7E8A95",
          400: "#55616C", 500: "#38424B", 600: "#2A333B",
          700: "#222B33", 800: "#1B2228", 900: "#141A1F",
        },
        ink: {
          0: "var(--ink-0)",
          1: "var(--ink-1)",
          2: "var(--ink-2)",
          3: "var(--ink-3)",
          4: "var(--ink-4)",
        },
      },
      /* Fonts are self-hosted via next/font — the variables are injected on
         <html> (see src/app/layout.tsx). */
      fontFamily: {
        sans: ["var(--font-readex)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "var(--font-readex)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
        arabic: ["var(--font-plex-arabic)", "var(--font-readex)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(120deg, #2ED2FF 0%, #C48A5C 100%)",
        "grad-signal": "linear-gradient(90deg, #2ED2FF, #8AE8FF 40%, #C48A5C 100%)",
        "grad-aurora": "linear-gradient(135deg, #141A1F 0%, #2ED2FF 45%, #C48A5C 100%)",
        "grad-cta": "linear-gradient(120deg, #17B4E0 0%, #2ED2FF 50%, #C48A5C 100%)",
        "grad-text": "linear-gradient(100deg, #F6F8FA 0%, #CCD3DA 45%, #2ED2FF 100%)",
        "grad-text-light": "linear-gradient(100deg, #141A1F 0%, #0E90B8 55%, #8E5A36 100%)",
      },
      boxShadow: {
        "glow-violet-sm": "0 0 16px rgba(46,210,255,.32)",
        "glow-violet": "0 0 28px rgba(46,210,255,.42)",
        "glow-violet-lg": "0 0 56px rgba(46,210,255,.55)",
        "glow-mint-sm": "0 0 14px rgba(46,210,255,.28)",
        "glow-mint": "0 0 26px rgba(46,210,255,.4)",
        "glow-mint-lg": "0 0 52px rgba(46,210,255,.5)",
        "glow-rose": "0 0 22px rgba(196,138,92,.38)",
        "glow-arc": "0 0 28px rgba(46,210,255,.42)",
        "glow-copper": "0 0 22px rgba(196,138,92,.38)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,.08)",
      },
      borderRadius: { "4xl": "2rem", "5xl": "2.5rem" },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      animation: {
        "gradient-flow": "gradient-flow 8s ease infinite",
        "float-y": "float-y 6s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
      },
      keyframes: {
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "float-y": {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pulse-glow": {
          "0%,100%": { opacity: "0.55", filter: "blur(24px)" },
          "50%": { opacity: "1", filter: "blur(32px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
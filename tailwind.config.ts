import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clinical Integrity Design System
        primary: {
          DEFAULT: "#005253",
          fixed: "#a6eff1",
          "fixed-dim": "#8ad3d5",
          container: "#186b6d",
          "on-container": "#9fe9ea",
          foreground: "#ffffff",
        },
        "on-primary": "#ffffff",
        "on-primary-fixed": "#002021",
        "on-primary-fixed-variant": "#004f51",
        "inverse-primary": "#8ad3d5",

        secondary: {
          DEFAULT: "#306768",
          fixed: "#b5ecee",
          "fixed-dim": "#9ad0d2",
          container: "#b2eaeb",
          "on-container": "#356b6d",
          foreground: "#ffffff",
        },
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#002021",
        "on-secondary-fixed-variant": "#134e50",

        tertiary: {
          DEFAULT: "#404956",
          fixed: "#dae3f3",
          "fixed-dim": "#bec7d6",
          container: "#58616e",
          "on-container": "#d3dcec",
        },
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#131c27",
        "on-tertiary-fixed-variant": "#3e4754",

        surface: {
          DEFAULT: "#f8f9ff",
          bright: "#f8f9ff",
          dim: "#d6dae4",
          container: "#eaeef8",
          "container-lowest": "#ffffff",
          "container-low": "#f0f4fd",
          "container-high": "#e4e8f2",
          "container-highest": "#dee2ec",
          variant: "#dee2ec",
        },
        "on-surface": "#171c23",
        "on-surface-variant": "#3f4949",
        "inverse-surface": "#2c3138",
        "inverse-on-surface": "#edf1fb",

        outline: {
          DEFAULT: "#6f7979",
          variant: "#bec8c8",
        },

        error: {
          DEFAULT: "#ba1a1a",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
        "on-error": "#ffffff",

        background: "#f8f9ff",
        "on-background": "#171c23",
        "surface-tint": "#14696b",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        "clinical-mono": ["Inter", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        gutter: "1rem",
        "gutter-desktop": "1.5rem",
        margin: "1rem",
        "margin-tablet": "2rem",
        "margin-desktop": "3rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2rem",
      },
    },
  },
  plugins: [],
};

export default config;

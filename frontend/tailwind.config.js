/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clay Design System — Brand palette
        clay: {
          // Core
          ink:           "#0a0a0a",
          primary:       "#0a0a0a",
          "primary-active": "#1f1f1f",
          "primary-disabled": "#e5e5e5",
          body:          "#3a3a3a",
          "body-strong": "#1a1a1a",
          muted:         "#6a6a6a",
          "muted-soft":  "#9a9a9a",
          hairline:      "#e5e5e5",
          "hairline-soft": "#f0f0f0",
          // Canvas / surfaces
          canvas:        "#fffaf0",
          "surface-soft": "#faf5e8",
          "surface-card": "#f5f0e0",
          "surface-strong": "#ebe6d6",
          "surface-dark": "#0a1a1a",
          "surface-dark-elevated": "#1a2a2a",
          // Brand accents
          pink:          "#ff4d8b",
          teal:          "#1a3a3a",
          lavender:      "#b8a4ed",
          peach:         "#ffb084",
          ochre:         "#e8b94a",
          mint:          "#a4d4c5",
          coral:         "#ff6b5a",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      borderRadius: {
        "clay-xs":   "6px",
        "clay-sm":   "8px",
        "clay-md":   "12px",
        "clay-lg":   "16px",
        "clay-xl":   "24px",
        "clay-pill": "9999px",
      },
      letterSpacing: {
        "clay-display-xl": "-2.5px",
        "clay-display-lg": "-2px",
        "clay-display-md": "-1px",
        "clay-display-sm": "-0.5px",
        "clay-title-lg":   "-0.3px",
        "clay-caption-uc": "1.5px",
      },
    },
  },
  plugins: [],
}
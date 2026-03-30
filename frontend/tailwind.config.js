/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        surface: {
          50:  "#f8f9fa",
          100: "#f1f3f5",
          800: "#1e2027",
          900: "var(--bg-panel)",
          950: "var(--bg-input)",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover:   "#4f46e5",
        },
      },
    },
  },
  plugins: [],
};

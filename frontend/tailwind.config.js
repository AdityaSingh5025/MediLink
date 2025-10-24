/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020817", // 🌌 rich blue-900
        surface: "#0B1228",    // slightly lighter surface tone
        card: "#101935",       // card surfaces
        primary: "#3B82F6",    // bright accent blue
        accent: "#2563EB",     // darker blue (gradient end)
        border: "#1A2340",     // subtle border for cards/forms
        text: "#E2E8F0",       // main text
        muted: "#94A3B8",      // secondary text
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.4)",
        glow: "0 0 20px rgba(59,130,246,0.15)",
      },
    },
  },
  darkMode: false,
  plugins: [],
};

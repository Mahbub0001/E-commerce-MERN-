/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        ink: "#0f172a",
        mist: "#f8fafc",
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      boxShadow: {
        premium: "0 24px 70px rgba(15, 23, 42, 0.16)",
        glow: "0 16px 45px rgba(99, 102, 241, 0.35)",
      },
    },
  },
  plugins: [],
};

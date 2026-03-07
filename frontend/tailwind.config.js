/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0b",
        secondary: "#161618",
        accent: "#3b82f6",
        danger: "#ef4444",
        success: "#10b981",
        card: "#18181b",
        'card-hover': "#27272a",
        border: "#27272a",
        text: "#f4f4f5",
        'text-muted': "#a1a1aa",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

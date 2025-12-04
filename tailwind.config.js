/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          olive: '#768863',      // Primary Action (Light Mode)
          teal: '#93b6b4',       // Primary Action (Dark Mode) / Accents
          black: '#151715',      // Dark Mode Background
          surface: '#1e221e',    // Dark Mode Card Background
          surfaceLight: '#27272a' // Dark Mode "Pulse" Card Background
        }
      },
      fontFamily: {
        // Use for Headings
        sans: ['"Barlow"', 'sans-serif'],
        // Use for UI / Data / Nav
        condensed: ['"Barlow Semi Condensed"', 'sans-serif'],
      }
    }
  },
  plugins: [],
}





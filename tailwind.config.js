/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./packages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          olive: '#1a6391',      // Primary Action (Light Mode)
          teal: '#92b7b4',       // Secondary Accent
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





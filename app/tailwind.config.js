/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          light: '#fdfbf7',
          dark: '#2c2825',
          accent: '#8b5e34'
        }
      }
    },
  },
  plugins: [],
}
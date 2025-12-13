/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        swiss: {
          bg: '#FAFAF9', // Stone 50
          text: '#18181b', // Zinc 900
          accent: '#f97316', // Orange 500
          secondary: '#4f46e5', // Indigo 600
        }
      },
      fontFamily: {
        sans: ['Instrument Sans', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url('/noise.svg')",
      },
      boxShadow: {
        'soft': '0 20px 40px -15px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      }
    },
  },
  plugins: [],
}

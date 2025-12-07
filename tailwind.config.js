/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: '#020617',
        neon: {
          cyan: '#22d3ee',
          purple: '#a855f7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        technical: ['Space Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'void-gradient': 'radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.03) 0%, rgba(2, 6, 23, 0) 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

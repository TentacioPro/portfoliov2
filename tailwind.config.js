export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0a0a0a',
          card: '#141414',
          raised: '#1c1c1c',
          text: '#e5e5e5',
          muted: '#737373',
          accessible: '#a3a3a3',
          line: '#292929',
        },
        accent: {
          DEFAULT: '#22c55e',
          bright: '#4ade80',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        noise: "url('/noise.svg')",
      },
    },
  },
  plugins: [],
};

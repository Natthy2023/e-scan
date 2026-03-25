/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#10b981',
        'bg-dark': '#000000',
        'bg-light': '#f8fafc',
        // Ethiopian flag colors
        'ethiopia-green': '#078930',
        'ethiopia-yellow': '#FCDD09',
        'ethiopia-red': '#DA121A',
      },
      backgroundColor: {
        'dark': '#000000',
        'dark-secondary': '#1a1a1a',
      },
      animation: {
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

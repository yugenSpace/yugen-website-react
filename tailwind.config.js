/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: {
          900: '#000000',
          '900/80': 'rgba(0, 0, 0, 0.8)',
          '900/90': 'rgba(0, 0, 0, 0.9)',
        },
        white: {
          DEFAULT: '#ffffff',
          'a700': '#ffffff',
        },
        blue: {
          gray: {
            100: '#d9d9d9',
          }
        },
        gray: {
          100: '#f4f4f4',
        }
      },
      letterSpacing: {
        'widest': '10.5px',
        'wider': '4.13px',
        'wide': '3.75px',
      },
      boxShadow: {
        'xs': '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'xs': '40px',
      },
    },
  },
  plugins: [],
}
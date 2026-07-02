/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#2d1b12',
          800: '#4a3428',
          600: '#765e50',
          400: '#a89182'
        },
        brand: {
          950: '#572400',
          900: '#773100',
          800: '#9d4100',
          700: '#c65300',
          600: '#e76700',
          500: '#ef7900',
          100: '#ffe2c2',
          50: '#fff6eb'
        },
        accent: {
          600: '#d99a00',
          500: '#f5b51b',
          100: '#fff0bf',
          50: '#fffaf0'
        },
        canvas: '#fffaf5',
        line: '#eedfd3'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(87, 36, 0, 0.04), 0 12px 32px rgba(87, 36, 0, 0.08)',
        lift: '0 18px 50px rgba(87, 36, 0, 0.16)',
        sidebar: '10px 0 30px rgba(87, 36, 0, 0.16)'
      },
      animation: {
        'fade-in': 'fadeIn 240ms ease-out both',
        'slide-up': 'slideUp 300ms ease-out both',
        'soft-pulse': 'softPulse 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' }
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        softPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.55' }
        }
      }
    }
  },
  plugins: []
};

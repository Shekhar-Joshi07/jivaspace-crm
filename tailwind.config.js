/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#17201f',
          800: '#263532',
          600: '#60706c',
          400: '#94a39f'
        },
        brand: {
          950: '#092c28',
          900: '#0d3b36',
          800: '#105048',
          700: '#0b6c61',
          600: '#0c8f80',
          500: '#12a594',
          100: '#d9f3ee',
          50: '#effaf7'
        },
        accent: {
          600: '#dc6554',
          500: '#e37766',
          100: '#fbe5e0',
          50: '#fff5f2'
        },
        canvas: '#f5f7f6',
        line: '#dfe7e4'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(13, 59, 54, 0.04), 0 12px 32px rgba(13, 59, 54, 0.06)',
        lift: '0 18px 50px rgba(13, 59, 54, 0.14)',
        sidebar: '10px 0 30px rgba(3, 28, 25, 0.12)'
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

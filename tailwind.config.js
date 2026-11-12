/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Vazirmatn Variable"', 'Vazirmatn', 'system-ui', 'sans-serif'],
      },
      colors: {
        canvas: '#FCFBF8',
        cream: '#F5F0E8',
        brand: {
          DEFAULT: '#315C4C',
          dark: '#22453A',
          deep: '#17332B',
          light: '#3F7361',
          50: '#EFF4F1',
          100: '#DEEAE3',
        },
        accent: {
          DEFAULT: '#D88A52',
          soft: '#F6E5D6',
          dark: '#BE7038',
        },
        ink: '#252525',
        muted: '#777777',
        line: '#EAE6DF',
      },
      boxShadow: {
        soft: '0 10px 40px -24px rgba(37, 37, 37, 0.28)',
        lift: '0 30px 60px -40px rgba(34, 69, 58, 0.45)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      maxWidth: {
        content: '1240px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.9' },
        },
      },
      animation: {
        'fade-up': 'fade-up .7s cubic-bezier(.2,.7,.2,1) both',
        'soft-pulse': 'soft-pulse 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

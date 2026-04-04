/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        ink:      '#0a0a0f',
        surface:  '#13121a',
        surface2: '#1a1828',
        border:   '#1e1c2a',
        accent:   '#d4af37',
        accent2:  '#c084fc',
        muted:    '#6b6880',
      },
      animation: {
        'pulse-dot':   'pulseDot 2s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'float-delay': 'floatDelay 5s ease-in-out infinite',
        'fade-up':     'fadeUp 0.3s ease forwards',
      },
      keyframes: {
        pulseDot:  { '0%,100%': { opacity: '1', transform: 'scale(1)' },    '50%': { opacity: '0.5', transform: 'scale(1.4)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' },              '50%': { transform: 'translateY(-10px)' } },
        floatDelay:{ '0%,100%': { transform: 'translateY(0)' },              '50%': { transform: 'translateY(8px)' } },
        fadeUp:    { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

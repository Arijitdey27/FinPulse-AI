/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#09090b',
          900: '#111827',
          850: '#172033',
          800: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 24px 80px rgba(15, 23, 42, 0.32)',
      },
      backgroundImage: {
        'grid-fade':
          'radial-gradient(circle at top, rgba(99,102,241,0.18), transparent 32%), linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-fade': 'auto, 40px 40px, 40px 40px',
      },
    },
  },
  plugins: [],
}

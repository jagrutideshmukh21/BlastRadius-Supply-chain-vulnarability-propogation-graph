/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#f8fafc', // light canvas background
          900: '#ffffff', // header / card white
          800: '#f1f5f9', // hover / input slate
          750: '#e2e8f0', 
          700: '#e2e8f0', // borders
          600: '#cbd5e1',
        },
        graphite: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        cyan: {
          400: '#2563eb', // royal blue accent
          500: '#1d4ed8',
        },
        critical: '#dc2626',
        affected: '#ea580c',
        warning: '#d97706',
        verified: '#16a34a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

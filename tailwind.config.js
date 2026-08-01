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
        background: '#09090B',
        card: '#111318',
        'card-hover': '#161922',
        accent: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          light: 'rgba(124, 58, 237, 0.15)',
          glow: 'rgba(124, 58, 237, 0.35)',
        },
        success: {
          DEFAULT: '#10B981',
          light: 'rgba(16, 185, 129, 0.15)',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: 'rgba(239, 68, 68, 0.15)',
        },
        border: 'rgba(255, 255, 255, 0.06)',
        'border-strong': 'rgba(255, 255, 255, 0.12)',
        muted: '#A1A1AA',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      boxShadow: {
        'card-glow': '0 0 25px -5px rgba(124, 58, 237, 0.12)',
        'accent-glow': '0 0 20px 0 rgba(124, 58, 237, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(124, 58, 237, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(124, 58, 237, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}

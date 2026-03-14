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
        'aws-orange': '#FF9900',
        'aws-navy': '#232F3E',
        'aws-blue': '#1A73E8',
        'aws-teal': '#00A591',
        domain: {
          org: '#8B5CF6',
          new: '#3B82F6',
          migration: '#F59E0B',
          cost: '#10B981',
          improvement: '#EC4899',
        },
      },
      animation: {
        'flip': 'flip 0.6s ease-in-out',
        'draw': 'draw 1.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-orange': 'pulseOrange 2s infinite',
      },
      keyframes: {
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        draw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseOrange: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255, 153, 0, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(255, 153, 0, 0)' },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'aws-gradient': 'linear-gradient(135deg, #232F3E 0%, #1a2636 100%)',
        'orange-gradient': 'linear-gradient(135deg, #FF9900 0%, #FF6600 100%)',
      },
    },
  },
  plugins: [],
}

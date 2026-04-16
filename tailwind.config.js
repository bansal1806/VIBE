/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Black base (dark theme)
        black: {
          pure: '#000000',
          deep: '#0A0A0A',
        },
        // Cream base (light theme)
        cream: {
          pure: '#FFF8F0',
          light: '#FFFEF8',
          soft: '#F5F0E8',
          warm: '#FAF5ED',
          deep: '#E8E0D4',
        },
        // Neon accents
        neon: {
          green: '#00FF6A',
          blue: '#00D0FF',
          pink: '#FF2EC4',
          yellow: '#FFEB3B',
          purple: '#B400FF',
          cyan: '#00FFF0',
        },
        // Legacy support
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Nexus/Instagram inspired
        nexus: {
          blue: '#0095f6',
          'blue-hover': '#1877f2',
          gray: '#262626',
          'gray-light': '#363636',
          'gray-muted': '#8e8e8e',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'radar-scan': 'radarScan 3s linear infinite',
        'neon-flicker': 'neonFlicker 0.15s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'subtle-pulse': 'subtlePulse 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { 
            opacity: '1',
            filter: 'brightness(1) drop-shadow(0 0 10px currentColor)',
          },
          '50%': { 
            opacity: '0.8',
            filter: 'brightness(1.2) drop-shadow(0 0 20px currentColor)',
          },
        },
        radarScan: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        subtlePulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.9' },
        },
      },
      boxShadow: {
        'neon-green': '0 0 10px #00FF6A, 0 0 20px #00FF6A, 0 0 30px #00FF6A',
        'neon-blue': '0 0 10px #00D0FF, 0 0 20px #00D0FF, 0 0 30px #00D0FF',
        'neon-pink': '0 0 10px #FF2EC4, 0 0 20px #FF2EC4, 0 0 30px #FF2EC4',
        'neon-yellow': '0 0 10px #FFEB3B, 0 0 20px #FFEB3B, 0 0 30px #FFEB3B',
        'neon-purple': '0 0 10px #B400FF, 0 0 20px #B400FF, 0 0 30px #B400FF',
        'neon-cyan': '0 0 10px #00FFF0, 0 0 20px #00FFF0, 0 0 30px #00FFF0',
      },
    },
  },
  plugins: [],
}

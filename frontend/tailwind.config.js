/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-space': '#003153',
        'steel-azure': '#224C98',
        'quantum-cyan': '#008B8B',
        'cyber-cyan': '#00D4FF',
        'space-dark': '#0A0E1B',
        'space-indigo': '#1E2952',
        'glass-surface': '#1a1f3a',
        'quantum-green': '#10b981',
        'quantum-amber': '#f59e0b',
        'quantum-red': '#ef4444',
        'text-primary': '#ffffff',
        'text-secondary': '#94a3b8',
        'border': 'rgba(255, 255, 255, 0.1)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #003153 0%, #224C98 100%)',
        'gradient-accent': 'linear-gradient(135deg, #008B8B 0%, #00D4FF 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
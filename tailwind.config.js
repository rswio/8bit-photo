/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      fontFamily: { sans: ['"Press Start 2P"', 'monospace'] },
      colors: {
        background: '#0f111a',
        card:       '#141726',
        foreground: '#f2f2ee',
        primary:   { DEFAULT: '#ff4da6', foreground: '#0f111a' },
        secondary: { DEFAULT: '#00eaff', foreground: '#0f111a' },
        accent:    { DEFAULT: '#ffff33', foreground: '#0f111a' },
        muted:     { DEFAULT: '#1e2236', foreground: '#6b7299' },
        border:    '#2d3454',
        'neon-pink':   '#ff4da6',
        'neon-cyan':   '#00eaff',
        'neon-yellow': '#ffff33',
        'neon-green':  '#00e619',
        'arcade-dark': '#0f111a',
      },
      borderRadius: { lg: '0px', md: '0px', sm: '0px', DEFAULT: '0px' },
      keyframes: {
        'pixel-fade-in': { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        blink:       { '0%,50%': { opacity: '1' }, '51%,100%': { opacity: '0' } },
        'pulse-glow':{ '0%,100%': { opacity: '1', filter: 'brightness(1)' }, '50%': { opacity: '0.85', filter: 'brightness(1.1)' } },
      },
      animation: {
        'pixel-fade-in': 'pixel-fade-in 0.3s ease-out',
        blink:           'blink 1s step-end infinite',
        'pulse-glow':    'pulse-glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

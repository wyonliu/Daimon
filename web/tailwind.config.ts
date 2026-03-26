import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#c8a96e',
          600: '#b8963e',
          700: '#92710a',
          800: '#6b5300',
          900: '#452e00',
        },
        mystic: {
          50: '#f0f1ff',
          100: '#d4d5ff',
          200: '#a8a9ff',
          300: '#7c7dff',
          400: '#5051ff',
          500: '#2425ff',
          600: '#1a1bcc',
          700: '#121399',
          800: '#0c0d66',
          900: '#060733',
          950: '#030319',
        },
        void: {
          DEFAULT: '#0a0a16',
          light: '#12121f',
          lighter: '#1a1a2e',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'Noto Serif SC', 'serif'],
        serif: ['Georgia', 'Noto Serif SC', 'serif'],
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config

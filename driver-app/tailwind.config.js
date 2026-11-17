/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0B3D2E',
        primaryLight: '#0F6E56',
        accent: '#E8B84B',
        surface: '#FAFAF8',
        surfaceCard: '#FFFFFF',
        textPrimary: '#1A1A1A',
        textSecondary: '#6B6B66',
        border: '#E2E0D5',
        success: '#0F6E56',
        warning: '#E8B84B',
        danger: '#A32D2D',
      },
    },
  },
  plugins: [],
};

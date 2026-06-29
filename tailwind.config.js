import path from 'path';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      colors: {
        primary: {
          teal: '#1E3C42',
          plum: '#733843',
          tan: '#B48469',
        },

        cream: '#F7F1EC',

        surface: {
          DEFAULT: '#F1E8E2',
          alt: '#E7DDD6',
          muted: '#DDD1C8',
        },

        text: {
          dark: '#1F1400',
          mid: '#4E4A45',
          accent: '#FFFFFF',
        },

        line: 'rgba(30, 60, 66, 0.14)',
      },
    },
  },

  plugins: [],
};

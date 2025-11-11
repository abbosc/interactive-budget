/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors from openbudget.uz
        primary: {
          DEFAULT: '#197790',
          dark: '#1d728e',
          light: '#35bfdc',
          darker: '#086A75',
        },
        // Background colors
        background: {
          main: '#ffffff',
          page: '#f7f8fc',
          secondary: '#f5f5f5',
          dark: '#081f27',
          card: '#1f2c40',
          light: '#fafafa',
        },
        // Text colors
        text: {
          primary: '#081f27',
          secondary: '#777777',
          muted: '#999999',
          dark: '#242430',
          light: '#6b7280',
        },
        // Status colors
        success: {
          DEFAULT: '#28E050',
          dark: '#04b400',
          light: '#8CE66B',
        },
        warning: {
          DEFAULT: '#fac319',
          dark: '#F6B60B',
          light: '#fffecb',
        },
        error: {
          DEFAULT: '#FA1C4F',
          dark: '#d33b52',
          light: '#f54f4f',
        },
        info: {
          DEFAULT: '#35BEDA',
          dark: '#18a9e2',
          light: '#5ac8fa',
        },
        // Border colors
        border: {
          light: '#e4e4e4',
          DEFAULT: '#d2dfef',
          dark: '#a2b5bb',
        },
      },
    },
  },
  plugins: [],
}

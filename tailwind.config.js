/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AgroMind Core Palette
        primary: {
          DEFAULT: '#163A2D', // Deep Forest Green
          dark: '#002419',
          light: '#2A4D40',
          container: '#163A2D',
          fixed: '#C4EBD8',
          'fixed-dim': '#A8CFBD',
        },
        secondary: {
          DEFAULT: '#2F7D4A', // Core Agro Green
          dark: '#1B6C3B',
          light: '#68A357',
          container: '#A4F5B6',
          'fixed-dim': '#89D89C',
        },
        tertiary: {
          DEFAULT: '#E7A93B', // Harvest Amber
          container: '#472F00',
          fixed: '#FFDEAE',
          'fixed-dim': '#FCBB4C',
        },
        error: {
          DEFAULT: '#BA1A1A',
          container: '#FFDAD6',
        },
        surface: {
          DEFAULT: '#FCF9F0',
          dim: '#DDDDA1',
          bright: '#FCF9F0',
          variant: '#E5E2DA',
          tint: '#426657',
          container: {
            lowest: '#FFFFFF',
            low: '#F6F3EA', // Warm Sand canvas
            DEFAULT: '#F1EEE5',
            high: '#EBE8DF',
            highest: '#E5E2DA',
          },
        },
        'on-surface': '#1C1C17',
        'on-surface-variant': '#414844',
        outline: '#717974',
        'outline-variant': '#C1C8C3',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        gujarati: ['"Noto Sans Gujarati"', '"Plus Jakarta Sans"', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      spacing: {
        '2xs': '0.25rem',
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '3rem',
        margin: '1rem',
        'gutter-desktop': '2rem',
      },
    },
  },
  plugins: [],
}

const defaultTheme = require('tailwindcss/defaultTheme')

const extraSizings = {
  btn: '6rem',
  14: '3.5rem',
  '4xs': '10rem',
  '3xs': '12rem',
  '2xs': '16rem',
  xs: '20rem',
  sm: '24rem',
  md: '28rem',
  lg: '32rem',
  xl: '36rem',
  '2xl': '42rem',
  '3xl': '48rem',
  '4xl': '56rem',
  '5xl': '64rem',
  '6xl': '72rem'
}

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true
  },

  theme: {
    container: {
      center: true,
      padding: '1rem'
    },

    colors: {
      white: '#fff',
      black: '#04070a',
      leaderboard: '#00000d',
      transparent: 'transparent',

      dark: {
        border: 'rgba(210,210,225,0.05)',
        hover200: 'rgba(32,38,55,0.7)',
        hover300: 'rgba(21,23,30,0.6)',
        500: '#343c55',
        600: '#262b3b',
        700: '#1d1f2b',
        800: '#15171e',
        900: '#14151a'
      },

      /* primary: {
        100: '#f0feff',
        200: '#b3fbff',
        300: '#75f8ff',
        400: '#3df5ff',
        500: '#00F2FE',
        600: '#00c2cc',
        700: '#009199',
        800: '#006166',
        900: '#003033'
      }, */

      primary: {
        100: '#f0fffc',
        200: '#b3fff0',
        300: '#7affe4',
        400: '#3dffd8',
        500: '#00ffcc',
        600: '#00cca3',
        700: '#00997a',
        800: '#006652',
        900: '#003329'
      },

      aqua: {
        100: '#f0fffc',
        200: '#b3fff0',
        300: '#7affe4',
        400: '#3dffd8',
        500: '#00ffcc',
        600: '#00cca3',
        700: '#00997a',
        800: '#006652',
        900: '#003329'
      },

      red: {
        100: '#fcf3f4',
        200: '#f0cbce',
        300: '#e4a0a4',
        400: '#ff5778',
        500: '#ff2954',
        600: '#eb002f',
        700: '#83252b',
        800: '#53181c',
        900: '#280b0d'
      },

      gray: {
        50: '#F8FAFC',
        100: '#F1F5F9',
        200: '#E2E8F0',
        300: '#CBD5E1',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
        700: '#334155',
        800: '#1E293B',
        900: '#0F172A'
      }
    },

    extend: {
      flex: {
        2: '2 2 0%',
        3: '3 3 0%',
        4: '4 4 0%',
        5: '5 5 0%'
      },

      shadow: {
        inner: 'inset 0 0 8px 1px rgba(12,16,25,0.45)'
      },

      screens: {
        '2xl': '1536px',
        '3xl': '1960px'
      },

      fontSize: {
        '2xs': '0.7rem',
        footer: '0.85rem'
      },

      fontFamily: {
        sans: ['Nunito Sans', ...defaultTheme.fontFamily.sans],
        mono: ['Droid Sans', ...defaultTheme.fontFamily.mono]
      },

      opacity: {
        33: '0.33',
        90: '0.9'
      },

      maxHeight: {
        ...extraSizings,
        modal: '96vh',
        44: '11rem'
      },

      maxWidth: {
        ...extraSizings
      },

      width: {
        ...extraSizings,
        '1/8': '12.5%'
      },

      height: {
        ...extraSizings,
        36: '9rem',
        76: '19rem',
        92: '23rem',
        'perpetuals-trade': '44rem',
        'competition-hero': '576px',
        footer: '3.3rem',
        chart: '70vh',
        orders: '30vh'
      },

      minHeight: {
        ...extraSizings,
        chart: '70vh',
        orders: '30vh'
      },

      minWidth: {
        ...extraSizings
      }
    }
  },

  variants: {
    borderWidth: ['even', 'odd', 'first', 'last', 'responsive'],
    backgroundColor: ['hover'],
    borderColor: ['hover'],
    textColor: ['group-hover', 'hover']
  },

  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./**/*.vue'],
    whitelist: [
      'tooltip',
      'tooltip-arrow',
      'tooltip-inner',
      'vue-tooltip-theme'
    ],
    whitelistPatterns: [/tooltip/]
  }
}

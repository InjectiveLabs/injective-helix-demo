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
  mode: 'jit',

  future: {
    removeDeprecatedGapUtilities: true
  },

  theme: {
    container: {
      center: true,
      padding: '1rem'
    },

    boxShadow: {
      primary: '0px 0px 4px #00f2ff',
      card: '0px 0px 16px rgb(22 25 34 / 30%)',
      DEFAULT: '0px 0px 4px #08090c',
      sm: '0px 0px 5px #08090c',
      md: '0px 0px 6px #08090c',
      none: 'none',
      'top-bar-dark': '0px 1px 0px #2A2F41'
    },

    colors: {
      white: '#fff',
      black: '#04070a',
      transparent: 'transparent',
      current: 'current-color',

      primary: {
        100: '#f0feff',
        200: '#b3fbff',
        300: '#75f8ff',
        400: '#3df5ff',
        500: '#00f2ff',
        600: '#00c2cc',
        700: '#009199',
        800: '#006166',
        900: '#003033'
      },

      aqua: {
        100: '#cffced',
        200: '#9af9d9',
        300: '#65f5c5',
        400: '#35f2b3',
        500: '#0ee29b',
        600: '#0bb67d',
        700: '#08865c',
        800: '#065b3f',
        900: '#033021'
      },

      red: {
        100: '#fdceda',
        200: '#faa3b9',
        300: '#f87294',
        400: '#f64772',
        500: '#f3164d',
        600: '#cc0a3b',
        700: '#96082b',
        800: '#66051d',
        900: '#31020e'
      },

      gray: {
        100: '#F8F8F8',
        200: '#F2F2F2',
        300: '#D9DADC',
        400: '#a6a8ad',
        500: '#717584',
        600: '#434858',
        700: '#2A2F41',
        800: '#1d2130',
        850: '#191c27',
        900: '#14151A',
        950: '#151821',
        1000: '#16171d',
        1050: '#12141c'
      }
    },

    extend: {
      flex: {
        2: '2 2 0%',
        3: '3 3 0%',
        4: '4 4 0%',
        5: '5 5 0%'
      },

      borderColor: {
        DEFAULT: '#2A2F41'
      },

      scale: {
        '-100': '-1'
      },

      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        '2md': '800px',
        '3md': '840px',
        ...defaultTheme.screens,
        '2xl': '1366px',
        '3xl': '1440px',
        '4xl': '1681px'
      },

      fontSize: {
        '2xs': '0.7rem',
        footer: '0.85rem'
      },

      zIndex: {
        ...defaultTheme.zIndex,
        1000: '1000',
        1100: '1100',
        1110: '1110',
        1120: '1120'
      },

      fontFamily: {
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
        serif: ['Droid Sans', ...defaultTheme.fontFamily.serif],
        mono: ['Fira Mono', ...defaultTheme.fontFamily.mono]
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
        footer: '2.5rem',
        orders: '10rem',
        trades: '26rem'
      },

      minHeight: {
        ...extraSizings,
        orders: '10rem',
        loading: '4rem'
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
    maxHeight: ['responsive'],
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

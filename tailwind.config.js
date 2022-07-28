const defaultTheme = require('tailwindcss/defaultTheme')

const extraSizings = {
  btn: '6rem',
  12: '3rem',
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
      padding: {
        DEFAULT: '1rem',
        xs: '0.5rem',
        sm: '1rem'
      }
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
        100: '#E4F3FF',
        200: '#c8e6ff',
        300: '#8ac9fe',
        400: '#5eaff2',
        500: '#2891e9',
        600: '#1e70b5',
        700: '#1a5f99',
        800: '#006166',
        900: '#0a3d55'
      },

      aqua: {
        100: '#cffced',
        200: '#9af9d9',
        250: '#99FAFF',
        300: '#65f5c5',
        400: '#35f2b3',
        500: '#00F2FE',
        600: '#00A0A9',
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
        550: '#F3610F',
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
        950: '#202431',
        975: '#282C39',
        1000: '#16171d',
        1050: '#12141c'
      },

      helixGray: {
        500: '#434448',
        800: '#1C1E29',
        900: '#292C35'
      },

      blue: {
        200: '#0082FA'
      },

      green: {
        500: '#0EE29B'
      },

      orange: {
        500: '#F3610F'
      },

      yellow: {
        500: '#FFBC00'
      },

      warning: '#F7931A',

      error: '#FF0000'
    },

    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      '2md': '800px',
      '3md': '840px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1366px',
      '3xl': '1440px',
      '4xl': '1681px'
    },

    extend: {
      flex: {
        '0-auto': '0 0 auto',
        '0-full': '0 0 100%',
        2: '2 2 0%',
        3: '3 3 0%',
        4: '4 4 0%',
        5: '5 5 0%'
      },

      rotate: {
        135: '135deg'
      },

      borderColor: {
        DEFAULT: '#2A2F41'
      },

      scale: {
        '-100': '-1'
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '0.75rem' }],
        sm: ['0.875rem', { lineHeight: '0.875rem' }],
        base: ['1rem', { lineHeight: '1rem' }],
        xl: ['1.25rem', { lineHeight: '1.25rem' }],
        '3xs': '0.625rem',
        '2xs': '0.7rem',
        footer: '0.85rem'
      },

      zIndex: {
        ...defaultTheme.zIndex,
        900: '900',
        1000: '1000',
        1100: '1100',
        1110: '1110',
        1120: '1120',
        '-10': '-10'
      },

      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        serif: ['Droid Sans', ...defaultTheme.fontFamily.serif],
        mono: ['Fira Mono', ...defaultTheme.fontFamily.mono]
      },

      borderRadius: {
        '4xl': '32px'
      },

      opacity: {
        33: '0.33',
        90: '0.9'
      },

      lineHeight: {
        3.5: '0.875rem',
        5.5: '1.375rem',
        14: '3.5rem'
      },

      maxHeight: {
        ...extraSizings,
        modal: '96vh',
        44: '11rem'
      },

      maxWidth: {
        ...extraSizings,
        'max-w-full': '100%'
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
        4: '1rem',
        ...extraSizings,
        orders: '10rem',
        loading: '4rem'
      },

      minWidth: {
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
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

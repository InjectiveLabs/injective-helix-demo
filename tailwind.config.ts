import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'
import { colors } from './nuxt-config/tailwind'

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

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts,jsx,tsx}',
    './layouts/**/*.{vue,js,ts,jsx,tsx}',
    './pages/**/*.{vue,js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,vue}',
    './app.vue'
  ],

  theme: {
    extend: {
      colors: {
        ...colors
      },

      divideColor: {
        DEFAULT: '#202431'
      },

      borderColor: {
        DEFAULT: '#202431'
      },

      border: {
        DEFAULT: '#202431'
      },

      height: {
        footer: '2.5rem',
        orders: '10rem',
        trades: '26rem',
        header: '56px',
        subHeader: '50px',
        ...extraSizings
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
        '4xl': '1536px',
        '5xl': '1681px'
      },

      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '1.5' }], // 10px
        '3xs': ['0.5rem', { lineHeight: '1.5' }], // 8px
        xs: ['0.75rem', { lineHeight: '1.5' }], // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }], // 14px
        base: ['1rem', { lineHeight: '1.5' }], // 16px
        xl: ['1.25rem', { lineHeight: '1.5' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '1.5' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '1.5' }], // 30px
        footer: '0.85rem'
      },

      flex: {
        2: '2 2 0%'
      },

      rotate: {
        135: '135deg'
      },

      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Azeret Mono', ...defaultTheme.fontFamily.mono],
        rubik: ['Rubik One'],
        orbitron: ['Orbitron'],
        pingFang: ['PingFang SC'],
        proximaNova: ['Proxima Nova']
      },

      lineHeight: {
        14: '3.5rem'
      },

      maxHeight: {
        ...extraSizings
      },

      maxWidth: {
        ...extraSizings
      },

      minWidth: {
        ...extraSizings
      },

      minHeight: {
        ...extraSizings
      },

      width: {
        ...extraSizings
      }
    }
  },

  plugins: [
    plugin(({ addUtilities, addComponents, theme }) => {
      addUtilities({
        '.error-message': {
          fontSize: theme('fontSize.xs'),
          color: colors.red[500]
        },
        '.field-label': {
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.semibold'),
          color: 'white'
        },
        '.tab-field': {
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.bold'),
          color: colors.coolGray[400]
        },
        '.tab-label': {
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          color: colors.coolGray[300],
          userSelect: 'none',
          cursor: 'pointer'
        },
        '.tab-label:hover': {
          backgroundColor: colors.brand[800]
        },
        '.portfolio-title': {
          fontSize: theme('fontSize.2xl'),
          fontWeight: theme('fontWeight.bold')
        },
        '.table-label': {
          fontSize: theme('fontSize.xs'),
          color: colors.coolGray[400]
        }
      })

      addComponents({
        '.card': {
          border: `1px solid ${colors.brand[750]}`,
          borderRadius: theme('borderRadius.md'),
          backgroundColor: colors.brand[875]
        },

        '.card-opaque': {
          border: `1px solid ${colors.brand[800]}`,
          borderRadius: theme('borderRadius.md'),
          backgroundColor: 'transparent'
        },

        '.card-opaque:hover': {
          backgroundColor: colors.brand[800]
        }
      })
    })
  ]
}

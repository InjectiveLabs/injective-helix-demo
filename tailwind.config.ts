import type { Config } from 'tailwindcss'
// import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'
import { colors } from './nuxt-config/tailwind'

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

      border: {
        DEFAULT: '#202431'
      },

      height: {
        footer: '2.5rem',
        orders: '10rem',
        trades: '26rem',
        header: '56px'
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
          fontWeight: theme('fontWeight.medium')
        },
        '.tab-field': {
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.bold'),
          color: colors.gray[400]
        },
        '.tab-label': {
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          color: colors.gray[300],
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
          color: colors.gray[400]
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

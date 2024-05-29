import defaultTheme from 'tailwindcss/defaultTheme'
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

export default {
  presets: [require('@injectivelabs/ui-shared/lib/tailwind-preset.cjs')],
  content: ['./components/**/*.vue', './pages/**/*.vue', './layouts/*.vue'],
  safelist: [
    'border-4',
    'border-t-blue-200',
    'border-r-blue-200',
    'max-h-90%',
    'bg-gray-900/80',
    'text-red-500',
    'text-orange-400',
    'text-green-400',
    'text-primary-500',
    'btn-sm',
    'btn-md',
    'btn-lg',
    'btn-primary',
    'btn-primary-outline',
    'btn-danger',
    'btn-danger-outline',
    'btn-danger-ghost',
    'btn-success',
    'btn-success-outline'
  ],
  mode: 'jit',

  plugins: [
    ({ addUtilities, addComponents, theme }: any) => {
      addUtilities({
        '.error-message': {
          fontSize: theme('fontSize.xs'),
          color: theme('colors.red.500')
        },
        '.field-label': {
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium')
        },
        '.tab-field': {
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.bold'),
          color: theme('colors.gray.600')
        },
        '.tab-label': {
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          color: theme('colors.gray.300'),
          userSelect: 'none',
          cursor: 'pointer'
        },
        '.tab-label:hover': {
          backgroundColor: theme('colors.brand.800')
        },
        '.portfolio-title': {
          fontSize: theme('fontSize.2xl'),
          fontWeight: theme('fontWeight.bold')
        },
        '.table-label': {
          fontSize: theme('fontSize.xs'),
          color: theme('colors.gray.400')
        }
      })

      addComponents({
        // Primary
        '.btn-primary': {
          color: theme('colors.blue.900'),
          backgroundColor: theme('colors.blue.500'),
          border: `1px solid ${theme('colors.blue.500')}`
        },

        '.btn-primary:hover': {
          backgroundColor: `${theme('colors.blue.500')}BB`,
          border: `1px solid ${theme('colors.blue.500')}BB`
        },

        '.btn-primary:disabled': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.400'),
          border: `1px solid ${theme('colors.blue.500')}`,
          cursor: 'not-allowed'
        },

        '.btn-primary-outline': {
          color: theme('colors.gray-200'),
          backgroundColor: 'transparent',
          border: `1px solid ${theme('colors.blue.500')}`
        },

        '.btn-primary-outline:hover': {
          color: theme('colors.white'),
          backgroundColor: `${theme('colors.blue.500')}33`
        },

        '.btn-primary-outline:disabled': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.400'),
          border: `1px solid ${theme('colors.blue.500')}`,
          cursor: 'not-allowed'
        },

        '.btn-success': {
          color: theme('colors.green.900'),
          backgroundColor: theme('colors.green.500'),
          border: `1px solid ${theme('colors.green.500')}`
        },

        '.btn-success:hover': {
          backgroundColor: `${theme('colors.green.500')}BB`,
          border: `1px solid ${theme('colors.green.500')}BB`
        },

        '.btn-success:disabled': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.400'),
          border: `1px solid ${theme('colors.green.500')}`,
          cursor: 'not-allowed'
        },

        '.btn-success-outline': {
          color: theme('colors.gray-200'),
          backgroundColor: 'transparent',
          border: `1px solid ${theme('colors.green.500')}`
        },

        '.btn-success-outline:hover': {
          color: theme('colors.white'),
          backgroundColor: `${theme('colors.green.500')}33`
        },

        '.btn-success-outline:disabled': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.400'),
          border: `1px solid ${theme('colors.green.500')}`,
          cursor: 'not-allowed'
        },

        // Danger
        '.btn-danger': {
          color: theme('colors.red.900'),
          backgroundColor: theme('colors.red.500'),
          border: `1px solid ${theme('colors.red.500')}`
        },

        '.btn-danger:hover': {
          backgroundColor: `${theme('colors.red.500')}BB`,
          border: `1px solid ${theme('colors.red.500')}BB`
        },

        '.btn-danger:disabled': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.400'),
          border: `1px solid ${theme('colors.red.500')}`,
          cursor: 'not-allowed'
        },

        '.btn-danger-outline': {
          color: theme('colors.white'),
          backgroundColor: 'transparent',
          border: `1px solid ${theme('colors.red.500')}`
        },

        '.btn-danger-outline:hover': {
          backgroundColor: `${theme('colors.red.500')}33`
        },

        '.btn-danger-outline:disabled': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.400'),
          border: `1px solid ${theme('colors.red.500')}`,
          cursor: 'not-allowed'
        },

        '.btn-danger-ghost': {
          color: theme('colors.red.500'),
          backgroundColor: `${theme('colors.red.500')}33`,
          border: `1px solid transparent`
        },

        '.btn-danger-ghost:hover': {
          backgroundColor: `${theme('colors.red.500')}55`
        },

        '.btn-danger-ghost:disabled': {
          backgroundColor: 'transparent',
          color: theme('colors.gray.400'),
          border: `1px solid ${theme('colors.red.500')}`,
          cursor: 'not-allowed'
        },

        '.btn-xs': {
          padding: `${theme('padding.1')} ${theme('padding.2')}`,
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.md'),
          fontFamily: theme('fontFamily.sans')
        },

        '.btn-sm': {
          padding: `${theme('padding.1')} ${theme('padding.3')}`,
          fontSize: theme('fontSize.xs'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.md'),
          fontFamily: theme('fontFamily.sans')
        },

        '.btn': {
          padding: `${theme('padding.2')} ${theme('padding.6')}`,
          fontSize: theme('fontSize.sm'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.md'),
          fontFamily: theme('fontFamily.sans')
        },

        '.btn-md': {
          padding: `${theme('padding.2')} ${theme('padding.8')}`,
          fontSize: theme('fontSize.base'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.md'),
          fontFamily: theme('fontFamily.sans')
        },

        '.btn-lg': {
          padding: `${theme('padding.1')} ${theme('padding.8')}`,
          fontSize: theme('fontSize.xl'),
          fontWeight: theme('fontWeight.medium'),
          borderRadius: theme('borderRadius.md'),
          fontFamily: theme('fontFamily.sans')
        },

        '.card': {
          border: `1px solid ${theme('colors.brand.750')}`,
          borderRadius: theme('borderRadius.md'),
          backgroundColor: theme('colors.brand.875')
        },

        '.card-opaque': {
          border: `1px solid ${theme('colors.brand.800')}`,
          borderRadius: theme('borderRadius.md'),
          backgroundColor: theme('transparent')
        },

        '.card-opaque:hover': {
          backgroundColor: theme('colors.brand.800')
        }
      })
    }
  ],

  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        xs: '0.5rem',
        sm: '1.5rem',
        md: '2rem'
      }
    },

    boxShadow: {
      blue: '0px 0px 4px #00f2ff',
      card: '0px 0px 16px rgb(22 25 34 / 30%)',
      helix: '0px 0px 100px rgba(0, 0, 0, 0.1)',
      helixLight: '0px 0px 10px rgba(0,0,0,0.1)',
      DEFAULT: '0px 0px 4px #08090c',
      sm: '0px 0px 3px #08090c',
      md: '0px 0px 6px #08090c',
      none: 'none',
      dropdown: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
      'top-bar-dark': '0px 1px 0px #2A2F41'
    },

    colors: {
      ...colors
    },

    divideColor: {
      DEFAULT: '#202431'
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
        DEFAULT: '#1d2130'
      },

      scale: {
        '-100': '-1'
      },

      fontSize: {
        '2xs': '0.775rem',
        '3xs': ['0.675rem', { lineHeight: '0.7rem' }],
        xs: ['0.8rem', { lineHeight: '1rem' }],
        sm: ['0.925rem', { lineHeight: '1.25rem' }],
        base: ['1.025rem', { lineHeight: '1rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '3xl': ['2rem', { lineHeight: '2.25rem' }],
        footer: '0.85rem'
      },

      zIndex: {
        ...defaultTheme.zIndex,
        '-10': '-10'
      },

      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['Azeret Mono', ...defaultTheme.fontFamily.mono]
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
        trades: '26rem',
        header: '56px'
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
      },

      backgroundImage: {
        hero: 'url(/svg/helix-hero-bg.svg)'
      },

      boxShadow: {
        light: '0 0 100px 0 rgba(0, 0, 0, 0.1)' // adjust the alpha as per your requirement
      }
    }
  },

  variants: {
    borderWidth: ['even', 'odd', 'first', 'last', 'responsive'],
    backgroundColor: ['hover'],
    borderColor: ['hover'],
    maxHeight: ['responsive'],
    textColor: ['group-hover', 'hover']
  }
}

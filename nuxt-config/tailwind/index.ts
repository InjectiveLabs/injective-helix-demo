/**
 * Required to separate from the tailwind.config.ts
 * file because we import the colors in the trading view
 * component and it can't be compiled because
 * there is a require() in the tailwind.config.ts
 * which can't be compiled using Vite
 */
export const colors = {
  white: '#fff',
  black: '#04070a',
  transparent: 'transparent',
  current: 'current-color',

  gray: {
    100: '#F8F8F8',
    200: '#F2F2F2',
    300: '#D9DADC',
    350: '#D0D0D1',
    400: '#a6a8ad',
    450: '#A1A1A3',
    500: '#717584',
    600: '#434858',
    700: '#2A2F41',
    750: '#202431',
    775: '#282C39',
    800: '#1d2130',
    850: '#191c27',
    900: '#14161F',
    950: '#101219',
    1000: '#0C0D13'
  },

  blue: {
  50: '#FEE7EC',
    100: '#FDCEDA',
    200: '#FAA3B9',
    300: '#F87294',
    400: '#F64772',
    500: '#B300B3',
    550: '#330033',
    600: '#990099',
    700: '#990099',
    800: '#990099',
    900: '#330033'
  },

  orange: {
    500: '#F7931A'
  },

  red: {
    50: '#FEE7EC',
    100: '#FDCEDA',
    200: '#FAA3B9',
    300: '#F87294',
    400: '#F64772',
    500: '#B300B3',
    600: '#990099',
    700: '#990099',
    800: '#990099',
    900: '#330033'
  },

  green: {
    50: '#E7FEF6',
    100: '#CAFCEB',
    200: '#9AF9D9',
    300: '#65F5C5',
    400: '#35F2B3',
    500: '#0EE29B',
    600: '#0BB67D',
    700: '#08865C',
    800: '#065B3F',
    900: '#032B1E'
  }
}
